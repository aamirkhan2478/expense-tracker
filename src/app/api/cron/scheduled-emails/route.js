import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Expense from "@/models/expense";
import Income from "@/models/income";

/**
 * POST /api/cron/scheduled-emails
 * Cron endpoint for weekly summaries and recurring reminders.
 * Secure with a secret header to prevent unauthorized calls.
 * 
 * Trigger via Vercel Cron, GitHub Actions, or cron-job.org:
 *   POST /api/cron/scheduled-emails
 *   Header: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request) {
  try {
    // ── Security: validate cron secret ──
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET || "dev-cron-secret";
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return res.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const now = new Date();
    const todayDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon, 7=Sun
    const todayDate = now.toDateString();

    const { sendWeeklySpendingSummaryEmail, sendUpcomingReminderEmail } = require("@/lib/email");

    const users = await User.find({ emailVerified: true })
      .select("email name notificationPreferences")
      .lean();

    let weeklySentCount = 0;
    let remindersSentCount = 0;

    for (const user of users) {
      const prefs = user.notificationPreferences || {};

      // ── Weekly Spending Summary ──
      if (prefs.weeklySummary !== false) {
        const summaryDay = prefs.weeklySummaryDay ?? 1;
        if (todayDayOfWeek === summaryDay) {
          try {
            // Calculate this week's data
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const prevWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

            const [expAgg, incAgg, prevExpAgg, topCatAgg, largestAgg] = await Promise.all([
              // This week's expenses
              Expense.aggregate([
                { $match: { user: user._id, expenseDate: { $gte: weekStart, $lte: now } } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
              ]),
              // This week's income
              Income.aggregate([
                { $match: { user: user._id, incomeDate: { $gte: weekStart, $lte: now } } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
              ]),
              // Previous week expenses (for comparison)
              Expense.aggregate([
                { $match: { user: user._id, expenseDate: { $gte: prevWeekStart, $lte: weekStart } } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
              ]),
              // Top categories this week
              Expense.aggregate([
                { $match: { user: user._id, expenseDate: { $gte: weekStart, $lte: now } } },
                { $group: { _id: "$category", total: { $sum: "$amount" } } },
                { $sort: { total: -1 } },
                { $limit: 5 },
                { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "cat" } },
                { $unwind: { path: "$cat", preserveNullAndEmpty: true } },
                { $project: { name: { $ifNull: ["$cat.name", "Unknown"] }, amount: "$total" } },
              ]),
              // Largest single expense this week
              Expense.aggregate([
                { $match: { user: user._id, expenseDate: { $gte: weekStart, $lte: now } } },
                { $sort: { amount: -1 } },
                { $limit: 1 },
                { $project: { title: 1, amount: 1 } },
              ]),
            ]);

            const totalSpending = expAgg[0]?.total || 0;
            const totalIncome = incAgg[0]?.total || 0;
            const prevSpending = prevExpAgg[0]?.total || 0;
            const netSavings = totalIncome - totalSpending;
            const diff = totalSpending - prevSpending;
            const trend = diff > 0 ? `↑ Up $${diff.toFixed(2)} vs last week` : diff < 0 ? `↓ Down $${Math.abs(diff).toFixed(2)} vs last week` : "→ Same as last week";

            const weekStartStr = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const weekEndStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            await sendWeeklySpendingSummaryEmail(
              user.email,
              user.name,
              {
                weekRange: `${weekStartStr} – ${weekEndStr}`,
                totalSpending: `$${totalSpending.toFixed(2)}`,
                totalIncome: `$${totalIncome.toFixed(2)}`,
                netSavings: `${netSavings >= 0 ? "+" : ""}$${netSavings.toFixed(2)}`,
                budgetUsage: 0, // Could be computed from category budgets if needed
                topCategories: topCatAgg.map(c => ({ name: c.name, amount: `$${Number(c.amount).toFixed(2)}` })),
                largestExpense: largestAgg[0] ? `${largestAgg[0].title} — $${Number(largestAgg[0].amount).toFixed(2)}` : "No expenses this week",
                weeklyComparison: prevSpending > 0 ? `Spent $${totalSpending.toFixed(2)} vs $${prevSpending.toFixed(2)} last week (${diff >= 0 ? "+" : ""}$${diff.toFixed(2)})` : "No data for previous week.",
                spendingTrend: trend,
                financialInsight: netSavings > 0
                  ? `Great job! You saved $${netSavings.toFixed(2)} this week. Keep it up!`
                  : `Your spending exceeded your income by $${Math.abs(netSavings).toFixed(2)} this week. Consider reviewing your budget.`,
              },
              user._id.toString()
            );

            weeklySentCount++;
          } catch (weeklyErr) {
            console.error(`[Cron] Weekly summary failed for ${user.email}:`, weeklyErr.message);
          }
        }
      }

      // ── Upcoming Recurring Reminders ──
      if (prefs.upcomingReminder !== false) {
        const daysBefore = prefs.reminderDaysBefore ?? 3;
        const reminderDate = new Date(now.getTime() + daysBefore * 24 * 60 * 60 * 1000);
        const reminderDateStr = reminderDate.toDateString();

        try {
          const recurringExpenses = await Expense.find({
            user: user._id,
            isRecurring: true,
          }).lean();

          for (const expense of recurringExpenses) {
            const lastDate = expense.lastProcessedAt || expense.expenseDate;
            const nextDue = getNextDueDate(lastDate, expense.recurringFrequency);

            if (nextDue.toDateString() === reminderDateStr) {
              await sendUpcomingReminderEmail(
                user.email,
                user.name,
                {
                  transactionName: expense.title,
                  amount: `$${Number(expense.amount).toFixed(2)}`,
                  category: "Expense",
                  dueDate: nextDue.toLocaleDateString("en-US", { dateStyle: "medium" }),
                  frequency: expense.recurringFrequency || "N/A",
                  nextPaymentDate: nextDue.toLocaleDateString("en-US", { dateStyle: "medium" }),
                },
                user._id.toString()
              );
              remindersSentCount++;
            }
          }
        } catch (reminderErr) {
          console.error(`[Cron] Reminders failed for ${user.email}:`, reminderErr.message);
        }
      }
    }

    return res.json({
      success: true,
      message: "Scheduled emails processed",
      weeklySummariesSent: weeklySentCount,
      remindersSent: remindersSentCount,
      usersProcessed: users.length,
      processedAt: now.toISOString(),
    });
  } catch (err) {
    console.error("[Cron] Error:", err.message);
    return res.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

function getNextDueDate(date, frequency) {
  const next = new Date(date);
  switch (frequency) {
    case "daily":   next.setDate(next.getDate() + 1); break;
    case "weekly":  next.setDate(next.getDate() + 7); break;
    case "monthly": next.setMonth(next.getMonth() + 1); break;
    case "yearly":  next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
}
