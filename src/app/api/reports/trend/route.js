import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Expense from "@/models/expense";
import Income from "@/models/income";
import User from "@/models/user";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user");
  const yearParam = searchParams.get("year");

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
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

    // Monthly income aggregation
    const incomeByMonth = await Income.aggregate([
      {
        $match: {
          user: userExist._id,
          incomeDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $month: "$incomeDate" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly expense aggregation
    const expenseByMonth = await Expense.aggregate([
      {
        $match: {
          user: userExist._id,
          expenseDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $month: "$expenseDate" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const incomeMap = {};
    incomeByMonth.forEach((item) => {
      incomeMap[item._id] = item.total;
    });

    const expenseMap = {};
    expenseByMonth.forEach((item) => {
      expenseMap[item._id] = item.total;
    });

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const trend = months.map((name, index) => {
      const monthNum = index + 1;
      const income = incomeMap[monthNum] || 0;
      const expense = expenseMap[monthNum] || 0;
      return {
        month: name,
        income,
        expense,
        savings: income - expense,
      };
    });

    return res.json({
      success: true,
      trend,
      year,
    });
  } catch (err) {
    console.log(err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
