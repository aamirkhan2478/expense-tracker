import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Income from "@/models/income";
import Expense from "@/models/expense";
import Category from "@/models/category";
import mongoose from "mongoose";

const PAGE_SIZE_INCOME = 5;
const PAGE_SIZE_EXPENSE = 5;

function calculateRelevance(item, query, type) {
  const q = query.toLowerCase();
  const qNum = Number(query);
  let score = 0;

  const title = (item.title || "").toLowerCase();
  const companyName = (item.companyName || "").toLowerCase();
  const categoryName = (item.category?.name || "").toLowerCase();

  if (title === q) score += 100;
  else if (title.startsWith(q)) score += 80;
  else if (title.includes(q)) score += 60;

  if (type === "income") {
    if (companyName === q) score += 70;
    else if (companyName.startsWith(q)) score += 55;
    else if (companyName.includes(q)) score += 40;
  }

  if (type === "expense" && categoryName) {
    if (categoryName === q) score += 50;
    else if (categoryName.startsWith(q)) score += 35;
    else if (categoryName.includes(q)) score += 20;
  }

  if (!isNaN(qNum) && item.amount === qNum) score += 50;
  else if (!isNaN(qNum) && String(item.amount).includes(query)) score += 30;

  const itemDate = type === "income" ? item.incomeDate : item.expenseDate;
  if (itemDate) {
    const dateStr = new Date(itemDate).toISOString().split("T")[0];
    if (dateStr === query) score += 40;
    else if (dateStr.includes(query)) score += 20;
  }

  if (item.isRecurring) score += 5;

  return score;
}

function highlightText(text, query) {
  if (!text || !query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return text.replace(regex, "**$1**");
}

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

  const query = q.trim();
  if (!query) {
    return res.json({ success: true, query: "", results: [], groups: {} }, { status: 200 });
  }

  try {
    await connectToDB();

    const qLower = query.toLowerCase();
    const isNumber = !isNaN(query) && query !== "";
    const numValue = isNumber ? Number(query) : null;

    // Convert userId string to ObjectId for reliable matching
    const userObjectId = new mongoose.Types.ObjectId(user);

    // Date range filter
    let dateFilter = null;
    const parsedDate = new Date(query);
    if (!isNaN(parsedDate.getTime()) && query.length >= 4 && query.includes("-")) {
      const startOfDay = new Date(parsedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      dateFilter = { $gte: startOfDay, $lte: endOfDay };
    }

    // Build text conditions
    const textConditions = [
      { title: { $regex: query, $options: "i" } },
      { companyName: { $regex: query, $options: "i" } },
    ];
    if (isNumber) {
      textConditions.push({ amount: numValue });
    }

    // Income search
    const incomeFilter = { user: userObjectId, $or: textConditions };
    if (dateFilter) {
      incomeFilter.$or.push({ incomeDate: dateFilter });
    }

    // Expense search
    const expenseFilter = { user: userObjectId, $or: textConditions };
    if (dateFilter) {
      expenseFilter.$or.push({ expenseDate: dateFilter });
    }

    // Category search
    const categoryFilter = { user: userObjectId, name: { $regex: query, $options: "i" } };

    // Fetch ALL records for page calculation + matching records
    // CRITICAL: must use same sort order as the list APIs:
    //   Income list sorts by -createdAt
    //   Expense list sorts by -expenseDate
    const [
      allIncomes,
      matchingIncomes,
      allExpenses,
      matchingExpenses,
      categoryResults,
    ] = await Promise.all([
      Income.find({ user: userObjectId }).sort("-createdAt").select("_id").lean(),
      Income.find(incomeFilter).sort("-createdAt").limit(30).lean(),
      Expense.find({ user: userObjectId }).sort("-expenseDate").select("_id").lean(),
      Expense.find(expenseFilter).sort("-expenseDate").limit(30).populate("category", "name icon").lean(),
      Category.find(categoryFilter).sort("-createdAt").limit(10).lean(),
    ]);

    // Build ID-to-index maps for page calculation
    const incomeIndexMap = {};
    allIncomes.forEach((item, idx) => {
      incomeIndexMap[String(item._id)] = idx;
    });

    const expenseIndexMap = {};
    allExpenses.forEach((item, idx) => {
      expenseIndexMap[String(item._id)] = idx;
    });

    // Process income results with page calculation
    const incomeItems = matchingIncomes.map((item) => {
      const score = calculateRelevance(item, query, "income");
      const idStr = String(item._id);
      let idx = incomeIndexMap[idStr];
      if (idx === undefined) {
        console.warn(`[Search] Income record ${idStr} not found in index map. Total incomes: ${allIncomes.length}`);
        idx = 0;
      }
      const page = Math.floor(idx / PAGE_SIZE_INCOME) + 1;
      return {
        _id: idStr,
        type: "income",
        module: "Income",
        title: item.title,
        titleHighlighted: highlightText(item.title, query),
        subTitle: item.companyName,
        subTitleHighlighted: highlightText(item.companyName, query),
        amount: item.amount,
        date: item.incomeDate,
        isRecurring: item.isRecurring,
        recurringFrequency: item.recurringFrequency,
        score,
        page,
        route: "/income",
      };
    });

    // Process expense results with page calculation
    const expenseItems = matchingExpenses.map((item) => {
      const score = calculateRelevance(item, query, "expense");
      const idStr = String(item._id);
      let idx = expenseIndexMap[idStr];
      if (idx === undefined) {
        console.warn(`[Search] Expense record ${idStr} not found in index map. Total expenses: ${allExpenses.length}`);
        idx = 0;
      }
      const page = Math.floor(idx / PAGE_SIZE_EXPENSE) + 1;
      return {
        _id: idStr,
        type: "expense",
        module: "Expense",
        title: item.title,
        titleHighlighted: highlightText(item.title, query),
        subTitle: item.category?.name || "Uncategorized",
        subTitleHighlighted: highlightText(item.category?.name || "", query),
        amount: item.amount,
        date: item.expenseDate,
        category: item.category ? { name: item.category.name, icon: item.category.icon } : null,
        isRecurring: item.isRecurring,
        recurringFrequency: item.recurringFrequency,
        score,
        page,
        route: "/expense",
      };
    });

    // Process category results (not paginated)
    const categoryItems = categoryResults.map((item) => {
      const nameLower = (item.name || "").toLowerCase();
      let score = 0;
      if (nameLower === qLower) score += 90;
      else if (nameLower.startsWith(qLower)) score += 70;
      else if (nameLower.includes(qLower)) score += 50;

      return {
        _id: item._id.toString(),
        type: "category",
        module: "Category",
        title: item.name,
        titleHighlighted: highlightText(item.name, query),
        subTitle: item.budget > 0 ? `Budget: ${item.budget}` : "No budget set",
        amount: item.budget || 0,
        date: item.createdAt,
        category: { name: item.name, icon: item.icon },
        isRecurring: false,
        score,
        page: 1,
        route: "/category",
      };
    });

    // Combine, sort by score, limit
    const allResults = [...incomeItems, ...expenseItems, ...categoryItems]
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    // Group by module
    const groups = {};
    allResults.forEach((item) => {
      if (!groups[item.module]) groups[item.module] = [];
      groups[item.module].push(item);
    });

    return res.json(
      {
        success: true,
        query,
        count: allResults.length,
        results: allResults,
        groups,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search error:", error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
