import mongoose from "mongoose";
import Budget from "@/models/budget";
import Expense from "@/models/expense";
import { connectToDB } from "@/utils/database";
import {
  parseMonth,
  resolveCurrentDay,
  calculateBudgetSummary,
} from "./budget-calculator";

/**
 * Get the budget configuration and dynamic financial calculations for a user and month.
 *
 * @param {object} params
 * @param {string|mongoose.Types.ObjectId} params.userId Authenticated user ID
 * @param {string} params.month "YYYY-MM"
 * @param {Date|string} [params.referenceDate] Date used to determine "today"
 * @returns {Promise<{ hasBudget: boolean, budget: object|null, summary: object|null }>}
 */
export async function getBudgetSummaryForUser({ userId, month, referenceDate = new Date() }) {
  await connectToDB();

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid User ID");
  }

  const { year, month: monthNum, daysInMonth } = parseMonth(month);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Fetch the configured budget for this user and month
  const budgetDoc = await Budget.findOne({
    user: userObjectId,
    month,
  }).lean();

  if (!budgetDoc) {
    return {
      hasBudget: false,
      month,
      budget: null,
      summary: null,
    };
  }

  const activeDay = resolveCurrentDay(month, referenceDate);

  // Date boundaries
  const startOfMonth = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));
  const startOfToday = new Date(Date.UTC(year, monthNum - 1, activeDay, 0, 0, 0, 0));
  const endOfToday = new Date(Date.UTC(year, monthNum - 1, activeDay, 23, 59, 59, 999));

  // Perform single high-performance MongoDB aggregation with $facet
  const aggResult = await Expense.aggregate([
    {
      $match: {
        user: userObjectId,
        includeInBudget: true,
        expenseDate: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      },
    },
    {
      $facet: {
        spentBeforeToday: [
          { $match: { expenseDate: { $lt: startOfToday } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ],
        spentToday: [
          { $match: { expenseDate: { $gte: startOfToday, $lte: endOfToday } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ],
        spentThisMonth: [
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ],
      },
    },
  ]);

  const facet = aggResult[0] || {};
  const spentBeforeToday = facet.spentBeforeToday?.[0]?.total || 0;
  const spentToday = facet.spentToday?.[0]?.total || 0;
  const spentThisMonth = facet.spentThisMonth?.[0]?.total || 0;

  const summary = calculateBudgetSummary({
    dailyBudget: budgetDoc.dailyBudget,
    month,
    spentBeforeToday,
    spentToday,
    spentThisMonth,
    currentDay: activeDay,
    referenceDate,
  });

  return {
    hasBudget: true,
    month,
    budget: {
      id: budgetDoc._id.toString(),
      userId: budgetDoc.user.toString(),
      month: budgetDoc.month,
      dailyBudget: budgetDoc.dailyBudget,
      createdAt: budgetDoc.createdAt,
      updatedAt: budgetDoc.updatedAt,
    },
    summary,
  };
}

/**
 * Create or update (upsert) the daily budget for a user and month.
 *
 * @param {object} params
 * @param {string|mongoose.Types.ObjectId} params.userId Authenticated user ID
 * @param {string} params.month "YYYY-MM"
 * @param {number} params.dailyBudget Daily budget (> 0)
 * @param {Date|string} [params.referenceDate]
 * @returns {Promise<object>} Created/updated budget record + updated summary
 */
export async function setDailyBudgetForUser({
  userId,
  month,
  dailyBudget,
  referenceDate = new Date(),
}) {
  await connectToDB();

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid User ID");
  }

  // Parse & validate month
  parseMonth(month);

  const numDailyBudget = Number(dailyBudget);
  if (isNaN(numDailyBudget) || numDailyBudget <= 0) {
    throw new Error("Daily budget must be a positive number");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Upsert the budget record atomically — guarantees no duplicate record for (user, month)
  const budgetDoc = await Budget.findOneAndUpdate(
    { user: userObjectId, month },
    { $set: { dailyBudget: numDailyBudget } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Return fresh calculated summary
  return await getBudgetSummaryForUser({ userId, month, referenceDate });
}
