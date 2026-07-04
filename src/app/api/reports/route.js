import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Expense from "@/models/expense";
import Income from "@/models/income";
import Category from "@/models/category";
import User from "@/models/user";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user");
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");

  if (!userId) {
    return res.json(
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();

    const userExist = await User.findById(userId);
    if (!userExist) {
      return res.json(
        { success: false, error: "User not found" },
        { status: 400 }
      );
    }

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
          user: userExist._id,
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
          user: userExist._id,
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
          user: userExist._id,
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
      user: userExist._id,
      incomeDate: { $gte: startDate, $lte: endDate },
    })
      .sort({ amount: -1 })
      .select("title amount incomeDate companyName");

    const lowestIncome = await Income.findOne({
      user: userExist._id,
      incomeDate: { $gte: startDate, $lte: endDate },
    })
      .sort({ amount: 1 })
      .select("title amount incomeDate companyName");

    const highestExpense = await Expense.findOne({
      user: userExist._id,
      expenseDate: { $gte: startDate, $lte: endDate },
    })
      .sort({ amount: -1 })
      .populate("category", "name icon")
      .select("title amount expenseDate category");

    const lowestExpense = await Expense.findOne({
      user: userExist._id,
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
