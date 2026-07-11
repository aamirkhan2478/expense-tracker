import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Expense from "@/models/expense";
import Income from "@/models/income";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user");
  const sendEmail = searchParams.get("sendEmail") === "true";
  const year = parseInt(searchParams.get("year") || new Date().getFullYear());
  const month = parseInt(searchParams.get("month") || new Date().getMonth());

  if (!userId) {
    return res.json(
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();

    const user = await User.findById(userId);
    if (!user) {
      return res.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const startOfMonth = new Date(Date.UTC(year, month, 1));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
    const monthName = startOfMonth.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // Total income
    const incomeAgg = await Income.aggregate([
      {
        $match: {
          user: user._id,
          incomeDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalIncome = incomeAgg[0]?.total || 0;

    // Total expenses
    const expenseAgg = await Expense.aggregate([
      {
        $match: {
          user: user._id,
          expenseDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpense = expenseAgg[0]?.total || 0;

    // Top expense categories
    const topCategoriesAgg = await Expense.aggregate([
      {
        $match: {
          user: user._id,
          expenseDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { amount: -1 } },
      { $limit: 5 },
    ]);

    // Populate category names
    const Category = require("@/models/category").default;
    const categoryIds = topCategoriesAgg.map((c) => c._id);
    const categories = await Category.find({ _id: { $in: categoryIds } }).select("name");
    const catMap = {};
    categories.forEach((c) => (catMap[c._id.toString()] = c.name));

    const topCategories = topCategoriesAgg.map((c) => ({
      name: catMap[c._id.toString()] || "Unknown",
      amount: c.amount.toFixed(2),
    }));

    const netSavings = totalIncome - totalExpense;

    const report = {
      month: monthName,
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      netSavings: netSavings.toFixed(2),
      topCategories,
    };

    if (sendEmail) {
      const { sendMonthlyReportEmail } = require("@/lib/email");
      sendMonthlyReportEmail(
        user.email,
        user.name,
        monthName,
        report.totalIncome,
        report.totalExpense,
        report.netSavings,
        topCategories,
        user._id.toString()
      ).catch((err) => console.error("[MonthlyReport] Email failed:", err.message));
    }

    return res.json({ success: true, report }, { status: 200 });
  } catch (err) {
    console.error("[MonthlyReport] Error:", err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
