import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Expense from "@/models/expense";
import Income from "@/models/income";
import Category from "@/models/category";
import { requireUser } from "@/lib/auth-middleware";
import { toObjectId } from "@/utils/mongo";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");

  try {
    await connectToDB();

    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    const userId = auth.user.id;
    // aggregate() does not cast ids, so keep an ObjectId alongside the string.
    const userObjectId = toObjectId(userId);

    const year = parseInt(yearParam) || new Date().getFullYear();
    const month = monthParam ? parseInt(monthParam) : null;

    let startDate, endDate;
    if (month !== null && month >= 1 && month <= 12) {
      startDate = new Date(Date.UTC(year, month - 1, 1));
      endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    } else {
      startDate = new Date(Date.UTC(year, 0, 1));
      endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
    }

    // Income summary
    const incomeAgg = await Income.aggregate([
      {
        $match: {
          user: userObjectId,
          incomeDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          avg: { $avg: "$amount" },
          min: { $min: "$amount" },
          max: { $max: "$amount" },
        },
      },
    ]);

    // Expense summary
    const expenseAgg = await Expense.aggregate([
      {
        $match: {
          user: userObjectId,
          expenseDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          avg: { $avg: "$amount" },
          min: { $min: "$amount" },
          max: { $max: "$amount" },
        },
      },
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpense = expenseAgg[0]?.total || 0;
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    // Top spending categories
    const categoryAgg = await Expense.aggregate([
      {
        $match: {
          user: userObjectId,
          expenseDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    const categoryIds = categoryAgg.map((c) => c._id);
    const categories = await Category.find({ _id: { $in: categoryIds } }).select("name icon");
    const catMap = {};
    categories.forEach((c) => (catMap[c._id.toString()] = c));

    const topCategories = categoryAgg.map((c) => ({
      categoryId: c._id.toString(),
      name: catMap[c._id.toString()]?.name || "Uncategorized",
      icon: catMap[c._id.toString()]?.icon || "",
      amount: c.total,
      count: c.count,
      percentage: totalExpense > 0 ? Math.round((c.total / totalExpense) * 100) : 0,
    }));

    // Highest and lowest transactions
    const highestIncome = await Income.findOne({
      user: userObjectId,
      incomeDate: { $gte: startDate, $lte: endDate },
    })
      .sort({ amount: -1 })
      .select("title amount incomeDate companyName");

    const lowestIncome = await Income.findOne({
      user: userObjectId,
      incomeDate: { $gte: startDate, $lte: endDate },
    })
      .sort({ amount: 1 })
      .select("title amount incomeDate companyName");

    const highestExpense = await Expense.findOne({
      user: userObjectId,
      expenseDate: { $gte: startDate, $lte: endDate },
    })
      .sort({ amount: -1 })
      .populate("category", "name icon")
      .select("title amount expenseDate category");

    const lowestExpense = await Expense.findOne({
      user: userObjectId,
      expenseDate: { $gte: startDate, $lte: endDate },
    })
      .sort({ amount: 1 })
      .populate("category", "name icon")
      .select("title amount expenseDate category");

    return res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate,
        incomeCount: incomeAgg[0]?.count || 0,
        expenseCount: expenseAgg[0]?.count || 0,
        avgIncome: Math.round(incomeAgg[0]?.avg || 0),
        avgExpense: Math.round(expenseAgg[0]?.avg || 0),
        minIncome: incomeAgg[0]?.min || 0,
        maxIncome: incomeAgg[0]?.max || 0,
        minExpense: expenseAgg[0]?.min || 0,
        maxExpense: expenseAgg[0]?.max || 0,
      },
      topCategories,
      extremes: {
        highestIncome: highestIncome
          ? {
              title: highestIncome.companyName || highestIncome.title,
              amount: highestIncome.amount,
              date: highestIncome.incomeDate,
            }
          : null,
        lowestIncome: lowestIncome
          ? {
              title: lowestIncome.companyName || lowestIncome.title,
              amount: lowestIncome.amount,
              date: lowestIncome.incomeDate,
            }
          : null,
        highestExpense: highestExpense
          ? {
              title: highestExpense.title,
              amount: highestExpense.amount,
              date: highestExpense.expenseDate,
              category: highestExpense.category,
            }
          : null,
        lowestExpense: lowestExpense
          ? {
              title: lowestExpense.title,
              amount: lowestExpense.amount,
              date: lowestExpense.expenseDate,
              category: lowestExpense.category,
            }
          : null,
      },
      period: {
        year,
        month,
        label:
          month !== null
            ? new Date(year, month - 1).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })
            : `${year}`,
      },
    });
  } catch (err) {
    console.log(err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
