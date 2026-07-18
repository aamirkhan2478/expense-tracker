const { buildEmail } = require("./compiler");
const { enqueue } = require("./queue");
const config = require("./config");

// ─── Phase 1 Templates ───────────────────────────────────────────────────────
const welcomeTemplate = require("./templates/welcome");
const verifyEmailTemplate = require("./templates/verify-email");
const passwordResetTemplate = require("./templates/password-reset");
const budgetWarningTemplate = require("./templates/budget-warning");
const budgetExceededTemplate = require("./templates/budget-exceeded");
const monthlyReportTemplate = require("./templates/monthly-report");
const failedLoginTemplate = require("./templates/failed-login");

// ─── Phase 2 Templates ───────────────────────────────────────────────────────
const loginNotificationTemplate = require("./templates/login-notification");
const largeExpenseAlertTemplate = require("./templates/large-expense-alert");
const upcomingReminderTemplate = require("./templates/upcoming-reminder");
const weeklySpendingSummaryTemplate = require("./templates/weekly-spending-summary");
const recurringBatchSummaryTemplate = require("./templates/recurring-batch-summary");
const overspendingAlertTemplate = require("./templates/overspending-alert");
const savingsMilestoneTemplate = require("./templates/savings-milestone");
const bulkImportSummaryTemplate = require("./templates/bulk-import-summary");

// ─── Template Registry ────────────────────────────────────────────────────────
// Maps email type → { template, defaultSubject, defaultPreview, preferenceKey }
const TEMPLATE_REGISTRY = {
  // Phase 1
  "welcome": {
    template: welcomeTemplate,
    subject: "Welcome to SpendWise!",
    preview: "Your financial journey starts here.",
  },
  "verify-email": {
    template: verifyEmailTemplate,
    subject: "Verify your SpendWise account",
    preview: "Click the link to verify your email address.",
  },
  "password-reset": {
    template: passwordResetTemplate,
    subject: "Reset your SpendWise password",
    preview: "Click the link to reset your password.",
  },
  "budget-warning": {
    template: budgetWarningTemplate,
    subject: (v) => `Budget Warning: ${v.category} at ${v.percentage}%`,
    preview: (v) => `You've used ${v.percentage}% of your ${v.category} budget.`,
    preferenceKey: "budgetWarning",
  },
  "budget-exceeded": {
    template: budgetExceededTemplate,
    subject: (v) => `Budget Exceeded: ${v.category}`,
    preview: (v) => `You've exceeded your ${v.category} budget.`,
    preferenceKey: "budgetExceeded",
  },
  "monthly-report": {
    template: monthlyReportTemplate,
    subject: (v) => `Your ${v.month} Financial Report`,
    preview: (v) => `See how you did in ${v.month}.`,
  },
  "failed-login": {
    template: failedLoginTemplate,
    subject: "Security Alert: Failed Login Attempt",
    preview: "We detected a failed login on your account.",
    preferenceKey: "failedLogin",
  },
  // Phase 2
  "login-notification": {
    template: loginNotificationTemplate,
    subject: "Security Alert: New Login Detected",
    preview: "A new login was detected on your SpendWise account.",
    preferenceKey: "loginNotification",
  },
  "large-expense-alert": {
    template: largeExpenseAlertTemplate,
    subject: (v) => `Large Expense Alert: ${v.amount} Recorded`,
    preview: (v) => `A large expense of ${v.amount} has been recorded.`,
    preferenceKey: "largeExpenseAlert",
  },
  "upcoming-reminder": {
    template: upcomingReminderTemplate,
    subject: (v) => `Reminder: ${v.transactionName} is due on ${v.dueDate}`,
    preview: (v) => `Your recurring payment ${v.transactionName} (${v.amount}) is due soon.`,
    preferenceKey: "upcomingReminder",
  },
  "weekly-spending-summary": {
    template: weeklySpendingSummaryTemplate,
    subject: (v) => `Your Weekly Spending Summary — ${v.weekRange}`,
    preview: (v) => `Spending: ${v.totalSpending} | Savings: ${v.netSavings} this week.`,
    preferenceKey: "weeklySummary",
  },
  "recurring-batch-summary": {
    template: recurringBatchSummaryTemplate,
    subject: (v) => `Recurring Transactions Processed — ${v.processingDate}`,
    preview: (v) => `${v.totalSuccess} of ${v.totalProcessed} recurring transactions processed.`,
    preferenceKey: "recurringBatchSummary",
  },
  "overspending-alert": {
    template: overspendingAlertTemplate,
    subject: "Overspending Alert: Your Spending is Above Average",
    preview: "Your spending is significantly higher than your average.",
    preferenceKey: "overspendingAlert",
  },
  "savings-milestone": {
    template: savingsMilestoneTemplate,
    subject: (v) => `🎉 Savings Milestone Reached: ${v.milestoneName}`,
    preview: (v) => `You've reached ${v.progressPercent}% of your savings goal!`,
    preferenceKey: "savingsMilestone",
  },
  "bulk-import-summary": {
    template: bulkImportSummaryTemplate,
    subject: (v) => `Import Complete: ${v.successCount} of ${v.totalProcessed} Transactions Imported`,
    preview: (v) => `Your import is done. ${v.successCount} records imported successfully.`,
    preferenceKey: "bulkImportSummary",
  },
};

// ─── Preference checker ───────────────────────────────────────────────────────
/**
 * Check if a given email type is enabled based on global settings and user preferences.
 * Returns true if the email should be sent, false if it should be skipped.
 */
async function isEmailEnabled(type, userId) {
  const registration = TEMPLATE_REGISTRY[type];
  if (!registration || !registration.preferenceKey) return true; // No preference guard = always send

  const preferenceKey = registration.preferenceKey;

  // Check global email settings
  try {
    const { connectToDB } = require("../../utils/database");
    await connectToDB();

    // Dynamic require to avoid circular deps at top-level
    const { default: EmailSettings } = require("../../models/email-settings");
    const globalSettings = await EmailSettings.findOne({}).lean();
    if (globalSettings && globalSettings.enabledTemplates) {
      if (globalSettings.enabledTemplates[preferenceKey] === false) {
        console.log(`[Email] Globally disabled template skipped: ${type}`);
        return false;
      }
    }

    // Check user-level preferences
    if (userId) {
      const { default: User } = require("../../models/user");
      const user = await User.findById(userId).select("notificationPreferences").lean();
      if (user?.notificationPreferences) {
        if (user.notificationPreferences[preferenceKey] === false) {
          console.log(`[Email] User disabled template skipped: ${type} for user ${userId}`);
          return false;
        }
      }
    }
  } catch (err) {
    // Silently fall through — don't block emails on preference check failures
    console.warn(`[Email] Preference check failed for ${type}:`, err.message);
  }

  return true;
}

// ─── Core sender ─────────────────────────────────────────────────────────────
/**
 * Send a templated email.
 * @param {string} to
 * @param {string} type
 * @param {Object} variables
 * @param {string} [userId]
 * @returns {Promise<{jobId: string}|{skipped: true}>}
 */
async function sendTemplatedEmail(to, type, variables, userId) {
  const registration = TEMPLATE_REGISTRY[type];
  if (!registration) throw new Error(`Unknown email template type: ${type}`);

  // Check if email is enabled (global + user preference)
  const enabled = await isEmailEnabled(type, userId);
  if (!enabled) return { skipped: true };

  const subject = typeof registration.subject === "function"
    ? registration.subject(variables)
    : registration.subject;

  const previewText = typeof registration.preview === "function"
    ? registration.preview(variables)
    : (registration.preview || subject);

  const { html } = await buildEmail(type, registration.template, {
    ...variables,
    subject,
    previewText,
  });

  const jobId = await enqueue({ to, subject, html, type, userId });
  return { jobId };
}

// ─── Phase 1 Convenience Methods ─────────────────────────────────────────────
async function sendWelcomeEmail(to, name, userId) {
  return sendTemplatedEmail(to, "welcome", {
    name,
    dashboardUrl: `${config.frontendUrl}/dashboard`,
  }, userId);
}

async function sendVerificationEmail(to, name, token, userId) {
  return sendTemplatedEmail(to, "verify-email", {
    name,
    verificationUrl: `${config.frontendUrl}/verify-email?token=${token}`,
    expiresIn: "24 hours",
  }, userId);
}

async function sendPasswordResetEmail(to, name, token, userId) {
  return sendTemplatedEmail(to, "password-reset", {
    name,
    resetUrl: `${config.frontendUrl}/reset-password?token=${token}`,
    expiresIn: "1 hour",
  }, userId);
}

async function sendBudgetWarningEmail(to, name, category, spent, budget, percentage, month, userId) {
  return sendTemplatedEmail(to, "budget-warning", {
    name, category, spent, budget, percentage, month,
    expensesUrl: `${config.frontendUrl}/expense`,
  }, userId);
}

async function sendBudgetExceededEmail(to, name, category, spent, budget, overAmount, month, userId) {
  return sendTemplatedEmail(to, "budget-exceeded", {
    name, category, spent, budget, overAmount, month,
    expensesUrl: `${config.frontendUrl}/expense`,
  }, userId);
}

async function sendMonthlyReportEmail(to, name, month, totalIncome, totalExpense, netSavings, topCategories, userId) {
  const topCategoriesHtml = Array.isArray(topCategories)
    ? topCategories.map((cat, i) => `${i + 1}. ${cat.name} — ${cat.amount}`).join("<br/>")
    : topCategories || "No expenses recorded this month.";

  return sendTemplatedEmail(to, "monthly-report", {
    name, month, totalIncome, totalExpense, netSavings,
    topCategories: topCategoriesHtml,
    reportsUrl: `${config.frontendUrl}/reports`,
  }, userId);
}

async function sendFailedLoginAlert(to, name, timestamp, ipAddress, userAgent, userId) {
  return sendTemplatedEmail(to, "failed-login", {
    name, timestamp, ipAddress, userAgent,
    resetUrl: `${config.frontendUrl}/auth?mode=reset`,
  }, userId);
}

// ─── Phase 2 Convenience Methods ─────────────────────────────────────────────

async function sendLoginNotificationEmail(to, name, { timestamp, device, browser, os, location, ipAddress, loginMethod }, userId) {
  return sendTemplatedEmail(to, "login-notification", {
    name, timestamp, device, browser, os,
    location: location || "Unknown Location",
    ipAddress: ipAddress || "Unknown",
    loginMethod: loginMethod || "Password",
    activityUrl: `${config.frontendUrl}/settings`,
    secureAccountUrl: `${config.frontendUrl}/auth?mode=reset`,
  }, userId);
}

async function sendLargeExpenseAlertEmail(to, name, { amount, category, merchant, paymentMethod, date, budgetImpact }, userId) {
  return sendTemplatedEmail(to, "large-expense-alert", {
    name, amount, category,
    merchant: merchant || "N/A",
    paymentMethod: paymentMethod || "N/A",
    date: date || new Date().toLocaleDateString(),
    budgetImpact: budgetImpact || "This expense has been recorded against your category budget.",
    expenseUrl: `${config.frontendUrl}/expense`,
    budgetUrl: `${config.frontendUrl}/category`,
  }, userId);
}

async function sendUpcomingReminderEmail(to, name, { transactionName, amount, category, dueDate, frequency, nextPaymentDate }, userId) {
  return sendTemplatedEmail(to, "upcoming-reminder", {
    name, transactionName, amount, category, dueDate, frequency,
    nextPaymentDate: nextPaymentDate || "N/A",
    recurringUrl: `${config.frontendUrl}/expense`,
    settingsUrl: `${config.frontendUrl}/settings`,
  }, userId);
}

async function sendWeeklySpendingSummaryEmail(to, name, {
  weekRange, totalSpending, totalIncome, netSavings, budgetUsage,
  topCategories, largestExpense, weeklyComparison, spendingTrend, financialInsight,
}, userId) {
  const topCategoriesHtml = Array.isArray(topCategories)
    ? topCategories.map((c, i) => `${i + 1}. <strong>${c.name}</strong> — ${c.amount}`).join("<br/>")
    : topCategories || "No category data available.";

  return sendTemplatedEmail(to, "weekly-spending-summary", {
    name, weekRange, totalSpending, totalIncome, netSavings,
    budgetUsage: typeof budgetUsage === "number" ? budgetUsage.toFixed(0) : budgetUsage,
    topCategories: topCategoriesHtml,
    largestExpense: largestExpense || "N/A",
    weeklyComparison: weeklyComparison || "No comparison available.",
    spendingTrend: spendingTrend || "N/A",
    financialInsight: financialInsight || "Keep tracking your spending to get personalized insights!",
    reportUrl: `${config.frontendUrl}/reports`,
  }, userId);
}

async function sendRecurringBatchSummaryEmail(to, name, {
  totalProcessed, totalSuccess, totalFailed, totalAmount, processingDate, transactions,
}, userId) {
  const transactionsHtml = Array.isArray(transactions)
    ? transactions.map(t =>
        `<strong>${t.name}</strong> — ${t.amount} <em style="color:${t.status === 'success' ? '#059669' : '#DC2626'}">(${t.status})</em>`
      ).join("<br/>")
    : transactions || "No transaction details.";

  return sendTemplatedEmail(to, "recurring-batch-summary", {
    name, totalProcessed, totalSuccess, totalFailed,
    totalAmount: totalAmount || "N/A",
    processingDate: processingDate || new Date().toLocaleDateString(),
    transactionsList: transactionsHtml,
    reviewUrl: `${config.frontendUrl}/expense`,
  }, userId);
}

async function sendOverspendingAlertEmail(to, name, {
  alertMessage, currentSpending, averageSpending, difference, topCategories, suggestedActions,
}, userId) {
  const topCategoriesHtml = Array.isArray(topCategories)
    ? topCategories.map((c, i) => `${i + 1}. <strong>${c.name}</strong> — ${c.amount}`).join("<br/>")
    : topCategories || "N/A";

  const actionsHtml = Array.isArray(suggestedActions)
    ? "<ul style='margin:0;padding-left:18px'>" + suggestedActions.map(a => `<li>${a}</li>`).join("") + "</ul>"
    : suggestedActions || "Review your recent spending and adjust your budget.";

  return sendTemplatedEmail(to, "overspending-alert", {
    name, alertMessage, currentSpending, averageSpending, difference,
    topCategories: topCategoriesHtml,
    suggestedActions: actionsHtml,
    spendingUrl: `${config.frontendUrl}/expense`,
    budgetUrl: `${config.frontendUrl}/category`,
  }, userId);
}

async function sendSavingsMilestoneEmail(to, name, {
  milestoneName, totalSaved, goalAmount, progressPercent, encouragingMessage,
}, userId) {
  return sendTemplatedEmail(to, "savings-milestone", {
    name, milestoneName, totalSaved, goalAmount,
    progressPercent: Math.min(progressPercent, 100),
    encouragingMessage: encouragingMessage || "You're doing an incredible job managing your finances. Keep it up!",
    goalsUrl: `${config.frontendUrl}/dashboard`,
    newGoalUrl: `${config.frontendUrl}/dashboard`,
  }, userId);
}

async function sendBulkImportSummaryEmail(to, name, {
  totalProcessed, successCount, failedCount, duplicateCount, processingTime, errors,
}, userId) {
  let errorSummaryHtml = "All records were imported successfully.";
  if (failedCount > 0 && Array.isArray(errors) && errors.length > 0) {
    errorSummaryHtml = `<strong>Import Errors:</strong><br/>${errors.slice(0, 10).map(e => `<span style="color:#DC2626">• ${e}</span>`).join("<br/>")}`;
    if (errors.length > 10) errorSummaryHtml += `<br/><em>...and ${errors.length - 10} more. Download the full report for details.</em>`;
  }

  return sendTemplatedEmail(to, "bulk-import-summary", {
    name, totalProcessed, successCount, failedCount,
    duplicateCount: duplicateCount || 0,
    processingTime: processingTime || "N/A",
    errorSummary: errorSummaryHtml,
    viewTransactionsUrl: `${config.frontendUrl}/expense`,
    downloadReportUrl: `${config.frontendUrl}/expense`,
  }, userId);
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  // Core
  sendTemplatedEmail,
  TEMPLATE_REGISTRY,

  // Phase 1
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBudgetWarningEmail,
  sendBudgetExceededEmail,
  sendMonthlyReportEmail,
  sendFailedLoginAlert,

  // Phase 2
  sendLoginNotificationEmail,
  sendLargeExpenseAlertEmail,
  sendUpcomingReminderEmail,
  sendWeeklySpendingSummaryEmail,
  sendRecurringBatchSummaryEmail,
  sendOverspendingAlertEmail,
  sendSavingsMilestoneEmail,
  sendBulkImportSummaryEmail,
};
