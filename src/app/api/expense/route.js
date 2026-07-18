import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import mongoose from "mongoose";
import User from "@/models/user";
import Expense from "@/models/expense";
import Joi from "joi";

export async function POST(req) {
  const body = await req.json();
  const signupSchema = Joi.object({
    title: Joi.string().required(),
    amount: Joi.number().required(),
    expenseDate: Joi.date().required(),
    category: Joi.string().required(),
    user: Joi.string().required(),
    isRecurring: Joi.boolean().optional(),
    recurringFrequency: Joi.string().valid("daily", "weekly", "monthly", "yearly").optional(),
  });

  const { error } = signupSchema.validate(body, { abortEarly: false });
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

  const { title, amount, expenseDate, category, user, isRecurring, recurringFrequency } = body;

  try {
    await connectToDB();
    let userExist = await User.findById(user);
    if (!userExist) {
      return res.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 400,
        }
      );
    }
    const expense = new Expense({
      title,
      amount,
      expenseDate,
      category,
      user,
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? recurringFrequency : null,
      lastProcessedAt: isRecurring ? expenseDate : null,
    });
    await expense.save();

    // ── Fire email alerts asynchronously (non-blocking) ──
    ;(async () => {
      try {
        const { sendBudgetWarningEmail, sendBudgetExceededEmail, sendLargeExpenseAlertEmail, sendOverspendingAlertEmail } = require("@/lib/email");
        const Category = require("@/models/category").default;

        const cat = await Category.findById(category);

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
  const user = searchParams.get("user");
  const expensePage = searchParams.get("page");
  const expenseLimit = searchParams.get("limit");
  const category = searchParams.get("category") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const searchQuery = searchParams.get("searchQuery") || "";

  const page = Number(expensePage) || 1;
  const limit = Number(expenseLimit) || 5;
  const startIndex = (page - 1) * limit;

  try {
    await connectToDB();

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

    if (!user) {
      return res.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 400,
        }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.json(
        {
          success: false,
          error: "Invalid user id",
        },
        {
          status: 400,
        }
      );
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

    const filteredExpenses = await Expense.find({ user, ...filter });
    let totalAmount = 0;
    filteredExpenses.forEach((expense) => {
      totalAmount += expense.amount;
    });

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
