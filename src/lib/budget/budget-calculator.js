/**
 * Pure calculation functions for the Daily Budget feature.
 * Completely decoupled from database and React components for independent testability.
 */

/**
 * Dynamically calculate the number of days in a given year and month (1-indexed).
 * Correctly accounts for leap years (e.g. Feb 2024 = 29, Feb 2023 = 28).
 *
 * @param {number} year e.g. 2026
 * @param {number} month 1-12 e.g. 10 for October
 * @returns {number} number of days (28, 29, 30, or 31)
 */
export function getDaysInMonth(year, month) {
  // Day 0 of the following month gives the last day of the desired month
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Parse a "YYYY-MM" string into year, month number, and daysInMonth.
 *
 * @param {string} monthStr "YYYY-MM"
 * @returns {{ year: number, month: number, daysInMonth: number }}
 */
export function parseMonth(monthStr) {
  if (!monthStr || typeof monthStr !== "string") {
    throw new Error("Invalid month format. Expected YYYY-MM");
  }
  const parts = monthStr.split("-");
  if (parts.length !== 2) {
    throw new Error("Invalid month format. Expected YYYY-MM");
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    throw new Error("Invalid year or month values in YYYY-MM");
  }
  const daysInMonth = getDaysInMonth(year, month);
  return { year, month, daysInMonth };
}

/**
 * Determine the active day of the month for calculation purposes based on a reference date.
 * - If referenceDate is within the target month: returns referenceDate's day of month (1 to daysInMonth).
 * - If referenceDate is after target month: all days have passed (returns daysInMonth).
 * - If referenceDate is before target month: month hasn't started (returns 0).
 *
 * @param {string} monthStr "YYYY-MM"
 * @param {Date|string} [referenceDate] default Date.now()
 * @returns {number} 0 to daysInMonth
 */
export function resolveCurrentDay(monthStr, referenceDate = new Date()) {
  const { year, month, daysInMonth } = parseMonth(monthStr);
  const ref = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);

  const refYear = ref.getUTCFullYear();
  const refMonth = ref.getUTCMonth() + 1; // 1-12
  const refDate = ref.getUTCDate();

  // If the reference year & month match target month
  if (refYear === year && refMonth === month) {
    return Math.min(Math.max(1, refDate), daysInMonth);
  }

  // If reference date is after target month (past month)
  if (refYear > year || (refYear === year && refMonth > month)) {
    return daysInMonth;
  }

  // If reference date is before target month (future month)
  return 0;
}

/**
 * Calculate the complete budget summary dynamically.
 *
 * All financial state is derived on the fly:
 * - allocated budget until yesterday = (currentDay - 1) * dailyBudget
 * - carry forward = allocated budget until yesterday - expenses before today (negative if overspent)
 * - today's base budget = dailyBudget
 * - today's available budget = carry forward + today's base budget
 * - today's remaining = today's available budget - today's expenses
 * - monthly budget = dailyBudget * daysInMonth
 * - spent this month = total expenses in month
 * - remaining monthly budget = monthly budget - spent this month
 *
 * @param {object} params
 * @param {number} params.dailyBudget Configured daily budget amount (positive number)
 * @param {string} params.month "YYYY-MM" format
 * @param {number} [params.spentBeforeToday=0] Total expenses from start of month strictly before today
 * @param {number} [params.spentToday=0] Total expenses incurred today
 * @param {number} [params.spentThisMonth] Total expenses for the entire month (defaults to spentBeforeToday + spentToday)
 * @param {number} [params.currentDay] Day of the month (1-indexed). If omitted, derived from referenceDate.
 * @param {Date|string} [params.referenceDate] Reference date for evaluation
 * @returns {object} Calculated summary metrics
 */
export function calculateBudgetSummary({
  dailyBudget,
  month,
  spentBeforeToday = 0,
  spentToday = 0,
  spentThisMonth = null,
  currentDay = null,
  referenceDate = new Date(),
}) {
  const numDailyBudget = Number(dailyBudget) || 0;
  const { year, month: monthNum, daysInMonth } = parseMonth(month);

  const activeDay =
    currentDay !== null && currentDay !== undefined
      ? Number(currentDay)
      : resolveCurrentDay(month, referenceDate);

  const totalSpentMonth =
    spentThisMonth !== null && spentThisMonth !== undefined
      ? Number(spentThisMonth)
      : Number(spentBeforeToday) + Number(spentToday);

  // Previous days elapsed in this month before today
  const previousDays = Math.max(0, activeDay - 1);
  const allocatedUntilYesterday = previousDays * numDailyBudget;

  // Carry forward = unused balance from previous days (retains negative balance if overspent)
  const carriedForward = Math.round((allocatedUntilYesterday - Number(spentBeforeToday)) * 100) / 100;

  // Base daily budget for today (0 if month is outside active range)
  const dailyBaseBudget = activeDay >= 1 && activeDay <= daysInMonth ? numDailyBudget : 0;

  // Today's Available Budget = carry forward + daily base budget
  const todayAvailable = Math.round((carriedForward + dailyBaseBudget) * 100) / 100;

  // Today's remaining budget after deducting expenses recorded today
  const todayRemaining = Math.round((todayAvailable - Number(spentToday)) * 100) / 100;

  // Total allocated budget from day 1 through today
  const allocatedUntilToday = Math.min(activeDay, daysInMonth) * numDailyBudget;

  // Total monthly budget
  const monthlyBudget = Math.round(numDailyBudget * daysInMonth * 100) / 100;

  // Remaining budget for the entire month
  const remainingMonthlyBudget = Math.round((monthlyBudget - totalSpentMonth) * 100) / 100;

  // Days remaining in the month after today
  const daysRemaining = Math.max(0, daysInMonth - activeDay);

  // Month name formatting (e.g. "October 2026")
  const dateObj = new Date(Date.UTC(year, monthNum - 1, 1));
  const monthName = dateObj.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  return {
    month,
    monthName,
    year,
    monthNumber: monthNum,
    daysInMonth,
    currentDay: activeDay,
    daysRemaining,
    dailyBudget: numDailyBudget,
    dailyBaseBudget,
    carriedForward,
    todayAvailable,
    spentBeforeToday: Number(spentBeforeToday) || 0,
    spentToday: Number(spentToday) || 0,
    todayRemaining,
    monthlyBudget,
    spentThisMonth: totalSpentMonth,
    remainingThisMonth: remainingMonthlyBudget,
    remainingMonthlyBudget,
    allocatedUntilToday,
    isOverspentToday: todayRemaining < 0,
    isOverspentMonth: remainingMonthlyBudget < 0,
  };
}

/**
 * Helper to calculate budget summary from an array of expense objects.
 * Useful for in-memory testing or client-side recalculation.
 *
 * @param {object} params
 * @param {number} params.dailyBudget
 * @param {string} params.month "YYYY-MM"
 * @param {Array<{ amount: number, expenseDate: Date|string }>} params.expenses
 * @param {Date|string} [params.referenceDate]
 */
export function calculateBudgetFromExpenses({
  dailyBudget,
  month,
  expenses = [],
  referenceDate = new Date(),
}) {
  const { year, month: monthNum, daysInMonth } = parseMonth(month);
  const activeDay = resolveCurrentDay(month, referenceDate);

  const startOfMonth = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

  const startOfToday = new Date(Date.UTC(year, monthNum - 1, activeDay, 0, 0, 0, 0));
  const endOfToday = new Date(Date.UTC(year, monthNum - 1, activeDay, 23, 59, 59, 999));

  let spentBeforeToday = 0;
  let spentToday = 0;
  let spentThisMonth = 0;

  for (const exp of expenses) {
    if (!exp.expenseDate || typeof exp.amount !== "number") continue;
    // Only count expenses explicitly included in budget
    if (exp.includeInBudget !== true) continue;
    const d = new Date(exp.expenseDate);

    // Only count expenses within the month
    if (d >= startOfMonth && d <= endOfMonth) {
      spentThisMonth += exp.amount;

      if (activeDay > 0) {
        if (d < startOfToday) {
          spentBeforeToday += exp.amount;
        } else if (d >= startOfToday && d <= endOfToday) {
          spentToday += exp.amount;
        }
      }
    }
  }

  return calculateBudgetSummary({
    dailyBudget,
    month,
    spentBeforeToday,
    spentToday,
    spentThisMonth,
    currentDay: activeDay,
    referenceDate,
  });
}
