import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Expense from "@/models/expense";
import Category from "@/models/category";
import User from "@/models/user";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user");

  if (!userId) {
    return res.json(
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();

    const userExist = await User.findOne({ user: userId });
    if (!userExist) {
      return res.json(
        { success: false, error: "User not found" },
        { status: 400 }
      );
    }

    // Get current month start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get all categories for user with budget
    const categories = await Category.find({ user: userId }).select("name icon budget");

    // Aggregate expenses by category for current month
    const expenseAggregation = await Expense.aggregate([
      {
        $match: {
          user: userExist._id,
          expenseDate: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Map category IDs to spending
    const spendingMap = {};
    expenseAggregation.forEach((item) => {
      spendingMap[item._id.toString()] = item.totalSpent;
    });

    // Build response with budget vs actual
    const budgetSummary = categories.map((cat) => {
      const spent = spendingMap[cat._id.toString()] || 0;
      const budget = cat.budget || 0;
      const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
      return {
        categoryId: cat._id.toString(),
        name: cat.name,
        icon: cat.icon,
        budget,
        spent,
        remaining: Math.max(budget - spent, 0),
        percentage,
        overBudget: spent > budget && budget > 0,
      };
    });

    // Only return categories that have a budget set OR have spending
    const filteredSummary = budgetSummary.filter(
      (item) => item.budget > 0 || item.spent > 0
    );

    // Sort by percentage descending (highest usage first)
    filteredSummary.sort((a, b) => b.percentage - a.percentage);

    return res.json({
      success: true,
      summary: filteredSummary,
      month: now.toLocaleString("default", { month: "long", year: "numeric" }),
    });
  } catch (err) {
    console.log(err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
