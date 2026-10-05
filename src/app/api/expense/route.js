import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Expense from "@/models/expense";
import Category from "@/models/category";
import { requireUser } from "@/lib/auth-middleware";
import { expenseCreateSchema } from "@/lib/validation/transactions";
import { toObjectId } from "@/utils/mongo";

export async function POST(req) {
  try {
    await connectToDB();

    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    const userId = auth.user.id;
    const userExist = await User.findById(userId)
      .select("email name notificationPreferences")
      .lean();
    if (!userExist) {
      return res.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    // The owning user is derived from the token — drop any client-supplied "user".
    const { user: _clientUser, ...payload } = body;

    const { error, value } = expenseCreateSchema.validate(payload, { abortEarly: false });
    if (error) {
      return res.json(
        {
          success: false,
          error: error.details[0].message,
        },
        {
          status: 400,
        }
      );
    }

    const { title, amount, expenseDate, category, isRecurring, recurringFrequency, includeInBudget } = value;

    // The category must belong to the authenticated user.
    const cat = await Category.findOne({ _id: category, user: userId })
      .select("_id name budget")
      .lean();
    if (!cat) {
      return res.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const expense = new Expense({
      title,
      amount,
      expenseDate,
      category,
      user: userId,
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? recurringFrequency : null,
      lastProcessedAt: isRecurring ? expenseDate : null,
      includeInBudget: includeInBudget || false,
    });
    await expense.save();

    // ── Fire email alerts asynchronously (non-blocking) ──
    ;(async () => {
      try {
        const { sendBudgetWarningEmail, sendBudgetExceededEmail, sendLargeExpenseAlertEmail, sendOverspendingAlertEmail } = require("@/lib/email");

        // ── Large Expense Alert ──
        const prefs = userExist.notificationPreferences || {};
        const largeExpenseThreshold = prefs.largeExpenseThreshold ?? 500;
        if (amount >= largeExpenseThreshold) {
          await sendLargeExpenseAlertEmail(
            userExist.email,
            userExist.name,
            {
              amount: `${amount.toFixed(2)}`,
              category: cat?.name || "Uncategorized",
              merchant: title,
              paymentMethod: "N/A",
              date: new Date(expenseDate).toLocaleDateString("en-US", { dateStyle: "medium" }),
              budgetImpact: cat?.budget
                ? `This expense represents ${Math.round((amount / cat.budget) * 100)}% of your ${cat.name} monthly budget.`
                : "No budget set for this category.",
            },
            userExist._id.toString()
          );
        }

        // ── Budget threshold check ──
        if (cat && cat.budget && cat.budget > 0) {
          const now = new Date();
          const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
          const endOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59));

          const ExpenseModel = require("@/models/expense").default;
          const aggregation = await ExpenseModel.aggregate([
            {
              $match: {
                user: userExist._id,
                category: cat._id,
                includeInBudget: true,
                expenseDate: { $gte: startOfMonth, $lte: endOfMonth },
              },
            },
            { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
          ]);

          const totalSpent = aggregation[0]?.totalSpent || 0;
          const percentage = Math.round((totalSpent / cat.budget) * 100);
          const monthName = now.toLocaleString("default", { month: "long" });

          if (percentage >= 100) {
            const overAmount = (totalSpent - cat.budget).toFixed(2);
            await sendBudgetExceededEmail(
              userExist.email, userExist.name, cat.name,
              totalSpent.toFixed(2), cat.budget.toFixed(2), overAmount, monthName,
              userExist._id.toString()
            );
          } else if (percentage >= 80) {
            await sendBudgetWarningEmail(
              userExist.email, userExist.name, cat.name,
              totalSpent.toFixed(2), cat.budget.toFixed(2), percentage, monthName,
              userExist._id.toString()
            );
          }
        }

        // ── Overspending Alert ──
        const spendingThreshold = (prefs.spendingAlertThreshold ?? 1000);
        const now2 = new Date();
        const weekAgo = new Date(now2.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now2.getTime() - 14 * 24 * 60 * 60 * 1000);

        const ExpenseModel2 = require("@/models/expense").default;
        const [currentWeekAgg, prevWeekAgg] = await Promise.all([
          ExpenseModel2.aggregate([
            { $match: { user: userExist._id, expenseDate: { $gte: weekAgo, $lte: now2 } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
          ExpenseModel2.aggregate([
            { $match: { user: userExist._id, expenseDate: { $gte: twoWeeksAgo, $lte: weekAgo } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]),
        ]);

        const currentWeekSpend = currentWeekAgg[0]?.total || 0;
        const prevWeekSpend = prevWeekAgg[0]?.total || 0;
        const difference = currentWeekSpend - prevWeekSpend;
        const isOverspending = currentWeekSpend > spendingThreshold ||
          (prevWeekSpend > 0 && currentWeekSpend > prevWeekSpend * 1.5);

        if (isOverspending) {
          // Get top spending categories this week
          const topCatAgg = await ExpenseModel2.aggregate([
            { $match: { user: userExist._id, expenseDate: { $gte: weekAgo, $lte: now2 } } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } },
            { $limit: 3 },
            { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "cat" } },
            { $unwind: { path: "$cat", preserveNullAndEmpty: true } },
            { $project: { name: { $ifNull: ["$cat.name", "Unknown"] }, amount: { $toString: "$total" } } },
          ]);

          await sendOverspendingAlertEmail(
            userExist.email,
            userExist.name,
            {
              alertMessage: currentWeekSpend > spendingThreshold
                ? `Your weekly spending of $${currentWeekSpend.toFixed(2)} has exceeded your alert threshold of $${spendingThreshold}.`
                : `Your spending this week is 50%+ higher than last week.`,
              currentSpending: `$${currentWeekSpend.toFixed(2)}`,
              averageSpending: `$${prevWeekSpend.toFixed(2)}`,
              difference: `$${difference.toFixed(2)}`,
              topCategories: topCatAgg,
              suggestedActions: [
                "Review your recent expenses for any unusual items.",
                "Consider reducing discretionary spending this week.",
                "Check your budget limits and adjust if needed.",
              ],
            },
            userExist._id.toString()
          );
        }
      } catch (alertErr) {
        console.error("[Expense] Alert check failed:", alertErr.message);
      }
    })();

    return res.json({ success: true, msg: "Expense created" }, { status: 201 });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const expensePage = searchParams.get("page");
  const expenseLimit = searchParams.get("limit");
  const category = searchParams.get("category") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const searchQuery = searchParams.get("searchQuery") || "";
  const isRecurring = searchParams.get("isRecurring") || "";

  const page = Number(expensePage) || 1;
  const limit = Number(expenseLimit) || 5;
  const startIndex = (page - 1) * limit;

  try {
    await connectToDB();

    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    const user = auth.user.id;

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (startDate && endDate) {
      filter.expenseDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    if (searchQuery) {
      filter.title = new RegExp(searchQuery, "i");
    }

    if (isRecurring === "true" || isRecurring === "false") {
      filter.isRecurring = isRecurring === "true";
    }

    const result = await Expense.find({
      user,
      ...filter,
    })
      .sort("-expenseDate")
      .skip(startIndex)
      .limit(limit)
      .populate("category", "name icon");

    const totalExpenses = await Expense.countDocuments({
      user,
      ...filter,
    });

    const endIndex = Math.min(startIndex + limit, totalExpenses);

    const pagination = {};

    if (endIndex < totalExpenses) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      pagination.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    // Aggregate the filtered total in the database rather than loading every
    // matching document into memory. aggregate() does no casting, so the user
    // id, the date bounds and the category must be real BSON values here or the
    // $match silently matches nothing and the total comes back as 0.
    const aggregateMatch = { user: toObjectId(user), ...filter };
    if (filter.expenseDate) {
      aggregateMatch.expenseDate = {
        $gte: new Date(filter.expenseDate.$gte),
        $lte: new Date(filter.expenseDate.$lte),
      };
    }
    if (filter.category) {
      aggregateMatch.category = toObjectId(filter.category);
    }

    const [totalAgg] = await Expense.aggregate([
      { $match: aggregateMatch },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    const totalAmount = totalAgg?.totalAmount || 0;

    return res.json(
      {
        success: true,
        data: result,
        page,
        totalExpenses,
        totalAmount,
        pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
