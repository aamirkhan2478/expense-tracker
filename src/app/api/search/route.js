import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Income from "@/models/income";
import Expense from "@/models/expense";
import mongoose from "mongoose";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const q = searchParams.get("q") || "";

  if (!user) {
    return res.json({ success: false, error: "User not found" }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    return res.json({ success: false, error: "Invalid user id" }, { status: 400 });
  }

  if (!q.trim()) {
    return res.json({ success: true, results: [] }, { status: 200 });
  }

  try {
    await connectToDB();

    const query = q.trim();
    const isNumber = !isNaN(query) && query !== "";
    const numValue = isNumber ? Number(query) : null;

    // Try to parse query as a date for date-range search
    let dateFilter = null;
    const parsedDate = new Date(query);
    if (!isNaN(parsedDate.getTime()) && query.length >= 4) {
      const startOfDay = new Date(parsedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      dateFilter = { $gte: startOfDay, $lte: endOfDay };
    }

    // Build text search conditions
    const textConditions = [];
    textConditions.push({ title: { $regex: query, $options: "i" } });
    textConditions.push({ companyName: { $regex: query, $options: "i" } });
    if (isNumber) {
      textConditions.push({ amount: numValue });
    }

    // Build income filter
    const incomeFilter = { user, $or: textConditions };
    if (dateFilter) {
      incomeFilter.$or.push({ incomeDate: dateFilter });
    }

    // Build expense filter
    const expenseFilter = { user, $or: textConditions };
    if (dateFilter) {
      expenseFilter.$or.push({ expenseDate: dateFilter });
    }

    // Execute parallel searches
    const [incomeResults, expenseResults] = await Promise.all([
      Income.find(incomeFilter).sort("-createdAt").limit(20).lean(),
      Expense.find(expenseFilter)
        .sort("-createdAt")
        .limit(20)
        .populate("category", "name icon")
        .lean(),
    ]);

    // Normalize results
    const normalizedIncomes = incomeResults.map((item) => ({
      _id: item._id.toString(),
      type: "income",
      title: item.title,
      subTitle: item.companyName,
      amount: item.amount,
      date: item.incomeDate,
      category: null,
      isRecurring: item.isRecurring,
      recurringFrequency: item.recurringFrequency,
    }));

    const normalizedExpenses = expenseResults.map((item) => ({
      _id: item._id.toString(),
      type: "expense",
      title: item.title,
      subTitle: item.category?.name || "Uncategorized",
      amount: item.amount,
      date: item.expenseDate,
      category: item.category
        ? {
            name: item.category.name,
            icon: item.category.icon,
          }
        : null,
      isRecurring: item.isRecurring,
      recurringFrequency: item.recurringFrequency,
    }));

    // Combine and sort by date descending
    const allResults = [...normalizedIncomes, ...normalizedExpenses].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return res.json(
      {
        success: true,
        query,
        count: allResults.length,
        results: allResults.slice(0, 20),
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
