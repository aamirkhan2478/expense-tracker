const { buildEmail } = require("./compiler");
const { enqueue } = require("./queue");
const config = require("./config");

// Templates
const welcomeTemplate = require("./templates/welcome");
const verifyEmailTemplate = require("./templates/verify-email");
const passwordResetTemplate = require("./templates/password-reset");
const budgetWarningTemplate = require("./templates/budget-warning");
const budgetExceededTemplate = require("./templates/budget-exceeded");
const monthlyReportTemplate = require("./templates/monthly-report");
const failedLoginTemplate = require("./templates/failed-login");

/**
 * Send a templated email.
 * @param {string} to
 * @param {string} type
 * @param {Object} variables
 * @param {string} [userId]
 */
async function sendTemplatedEmail(to, type, variables, userId) {
  let mjmlTemplate;
  let subject;
  let previewText;

  switch (type) {
    case "welcome":
      mjmlTemplate = welcomeTemplate;
      subject = "Welcome to SpendWise!";
      previewText = "Your financial journey starts here.";
      break;
    case "verify-email":
      mjmlTemplate = verifyEmailTemplate;
      subject = "Verify your SpendWise account";
      previewText = "Click the link to verify your email address.";
      break;
    case "password-reset":
      mjmlTemplate = passwordResetTemplate;
      subject = "Reset your SpendWise password";
      previewText = "Click the link to reset your password.";
      break;
    case "budget-warning":
      mjmlTemplate = budgetWarningTemplate;
      subject = `Budget Warning: ${variables.category} at ${variables.percentage}%`;
      previewText = `You've used ${variables.percentage}% of your ${variables.category} budget.`;
      break;
    case "budget-exceeded":
      mjmlTemplate = budgetExceededTemplate;
      subject = `Budget Exceeded: ${variables.category}`;
      previewText = `You've exceeded your ${variables.category} budget.`;
      break;
    case "monthly-report":
      mjmlTemplate = monthlyReportTemplate;
      subject = `Your ${variables.month} Financial Report`;
      previewText = `See how you did in ${variables.month}.`;
      break;
    case "failed-login":
      mjmlTemplate = failedLoginTemplate;
      subject = "Security Alert: Failed Login Attempt";
      previewText = "We detected a failed login on your account.";
      break;
    default:
      throw new Error(`Unknown email template type: ${type}`);
  }

  const { html } = await buildEmail(type, mjmlTemplate, { ...variables, subject, previewText });

  const jobId = await enqueue({
    to,
    subject,
    html,
    type,
    userId,
  });

  return { jobId };
}

// Convenience methods
async function sendWelcomeEmail(to, name, userId) {
  return sendTemplatedEmail(to, "welcome", { name, dashboardUrl: `${config.frontendUrl}/dashboard` }, userId);
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
    name,
    category,
    spent,
    budget,
    percentage,
    month,
    expensesUrl: `${config.frontendUrl}/expense`,
  }, userId);
}

async function sendBudgetExceededEmail(to, name, category, spent, budget, overAmount, month, userId) {
  return sendTemplatedEmail(to, "budget-exceeded", {
    name,
    category,
    spent,
    budget,
    overAmount,
    month,
    expensesUrl: `${config.frontendUrl}/expense`,
  }, userId);
}

async function sendMonthlyReportEmail(to, name, month, totalIncome, totalExpense, netSavings, topCategories, userId) {
  // Format top categories as a simple list
  const topCategoriesHtml = topCategories
    .map((cat, i) => `${i + 1}. ${cat.name} — ${cat.amount}`)
    .join("<br/>") || "No expenses recorded this month.";

  return sendTemplatedEmail(to, "monthly-report", {
    name,
    month,
    totalIncome,
    totalExpense,
    netSavings,
    topCategories: topCategoriesHtml,
    reportsUrl: `${config.frontendUrl}/reports`,
  }, userId);
}

async function sendFailedLoginAlert(to, name, timestamp, ipAddress, userAgent, userId) {
  return sendTemplatedEmail(to, "failed-login", {
    name,
    timestamp,
    ipAddress,
    userAgent,
    resetUrl: `${config.frontendUrl}/auth?mode=reset`,
  }, userId);
}

module.exports = {
  sendTemplatedEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBudgetWarningEmail,
  sendBudgetExceededEmail,
  sendMonthlyReportEmail,
  sendFailedLoginAlert,
};
