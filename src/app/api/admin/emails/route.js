import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import {
  EmailLog,
  getEmailLogs,
  getFailedEmails,
  retryEmail,
} from "@/lib/email/tracker";
import { enqueue } from "@/lib/email/queue";
import { requireAdmin } from "@/lib/auth-middleware";

// Template preview dummy variables used when generating test/preview HTML
const PREVIEW_VARIABLES = {
  welcome: {
    name: "Alex Johnson",
    dashboardUrl: "https://yourspendwise.vercel.app/dashboard",
  },
  "verify-email": {
    name: "Alex Johnson",
    verificationUrl: "https://yourspendwise.vercel.app/verify?token=abc123",
    expiresIn: "24 hours",
  },
  "password-reset": {
    name: "Alex Johnson",
    resetUrl: "https://yourspendwise.vercel.app/reset-passowrd?token=abc123",
    expiresIn: "1 hour",
  },
  "budget-warning": {
    name: "Alex Johnson",
    category: "Dining",
    spent: "$320.00",
    budget: "$400.00",
    percentage: "80",
    month: "July",
  },
  "budget-exceeded": {
    name: "Alex Johnson",
    category: "Entertainment",
    spent: "$520.00",
    budget: "$400.00",
    overAmount: "$120.00",
    month: "July",
  },
  "monthly-report": {
    name: "Alex Johnson",
    month: "June 2026",
    totalIncome: "$5,200",
    totalExpense: "$3,100",
    netSavings: "$2,100",
    topCategories:
      "1. Food — $820<br/>2. Transport — $540<br/>3. Utilities — $310",
    reportsUrl: "https://yourspendwise.vercel.app/reports",
  },
  "failed-login": {
    name: "Alex Johnson",
    timestamp: "Jul 18, 2026, 10:30 AM",
    ipAddress: "192.168.x.x",
    userAgent: "Chrome 126 on Windows 11",
    resetUrl: "https://yourspendwise.vercel.app/reset-password?token=abc123",
  },
  "login-notification": {
    name: "Alex Johnson",
    timestamp: "Jul 18, 2026, 10:30 AM",
    device: "Desktop",
    browser: "Chrome",
    os: "Windows",
    location: "IP: 192.168.x.x",
    ipAddress: "192.168.x.x",
    loginMethod: "Password",
    activityUrl: "https://yourspendwise.vercel.app/settings",
    secureAccountUrl: "https://yourspendwise.vercel.app/forget-password",
  },
  "large-expense-alert": {
    name: "Alex Johnson",
    amount: "$850.00",
    category: "Electronics",
    merchant: "Apple Store",
    paymentMethod: "Credit Card",
    date: "Jul 18, 2026",
    budgetImpact:
      "This expense represents 85% of your Electronics monthly budget.",
    expenseUrl: "https://yourspendwise.vercel.app/expense",
    budgetUrl: "https://yourspendwise.vercel.app/category",
  },
  "upcoming-reminder": {
    name: "Alex Johnson",
    transactionName: "Netflix Subscription",
    amount: "$15.99",
    category: "Subscriptions",
    dueDate: "Jul 21, 2026",
    frequency: "Monthly",
    nextPaymentDate: "Aug 21, 2026",
    recurringUrl: "https://yourspendwise.vercel.app/expense",
    settingsUrl: "https://yourspendwise.vercel.app/settings",
  },
  "weekly-spending-summary": {
    name: "Alex Johnson",
    weekRange: "Jul 12 – Jul 18",
    totalSpending: "$1,240.00",
    totalIncome: "$2,000.00",
    netSavings: "+$760.00",
    budgetUsage: "62",
    topCategories:
      "1. <strong>Food</strong> — $320.00<br/>2. <strong>Transport</strong> — $210.00<br/>3. <strong>Utilities</strong> — $180.00",
    largestExpense: "Grocery Shopping — $180.00",
    weeklyComparison: "Spent $1,240.00 vs $1,100.00 last week (+$140.00)",
    spendingTrend: "↑ Up $140.00 vs last week",
    financialInsight: "Great job! You saved $760.00 this week. Keep it up!",
    reportUrl: "https://yourspendwise.vercel.app/reports",
  },
  "recurring-batch-summary": {
    name: "Alex Johnson",
    totalProcessed: "4",
    totalSuccess: "3",
    totalFailed: "1",
    totalAmount: "$85.97",
    processingDate: "Jul 18, 2026",
    transactionsList:
      "<strong>Netflix</strong> — $15.99 <em style='color:#059669'>(success)</em><br/><strong>Spotify</strong> — $9.99 <em style='color:#059669'>(success)</em><br/><strong>Gym</strong> — $59.99 <em style='color:#059669'>(success)</em><br/><strong>iCloud</strong> — $2.99 <em style='color:#DC2626'>(failed)</em>",
    reviewUrl: "https://yourspendwise.vercel.app/expense",
  },
  "overspending-alert": {
    name: "Alex Johnson",
    alertMessage:
      "Your weekly spending of $1,850.00 has exceeded your alert threshold of $1,000.",
    currentSpending: "$1,850.00",
    averageSpending: "$1,100.00",
    difference: "$750.00",
    topCategories:
      "1. <strong>Dining</strong> — $450.00<br/>2. <strong>Shopping</strong> — $380.00<br/>3. <strong>Entertainment</strong> — $220.00",
    suggestedActions:
      "<ul style='margin:0;padding-left:18px'><li>Review your recent expenses for any unusual items.</li><li>Consider reducing discretionary spending this week.</li><li>Check your budget limits and adjust if needed.</li></ul>",
    spendingUrl: "https://yourspendwise.vercel.app/expense",
    budgetUrl: "https://yourspendwise.vercel.app/category",
  },
  "savings-milestone": {
    name: "Alex Johnson",
    milestoneName: "Halfway There! 🚀 — Emergency Fund",
    totalSaved: "$5,000.00",
    goalAmount: "$10,000.00",
    progressPercent: "50",
    encouragingMessage:
      "Incredible! You're halfway to your goal. Your discipline is paying off.",
    goalsUrl: "https://yourspendwise.vercel.app/dashboard",
    newGoalUrl: "https://yourspendwise.vercel.app/dashboard",
  },
  "bulk-import-summary": {
    name: "Alex Johnson",
    totalProcessed: "250",
    successCount: "238",
    failedCount: "8",
    duplicateCount: "4",
    processingTime: "3.24s",
    errorSummary:
      "<strong>Import Errors:</strong><br/><span style='color:#DC2626'>• Row 12: Invalid amount \"abc\".</span><br/><span style='color:#DC2626'>• Row 47: Invalid date \"31/13/2026\".</span>",
    viewTransactionsUrl: "https://yourspendwise.vercel.app/expense",
    downloadReportUrl: "https://yourspendwise.vercel.app/expense",
  },
};

export async function GET(request) {
  try {
    const admin = await requireAdmin(request);
    if (admin.error) return admin.error;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const preview = searchParams.get("preview"); // template type to preview

    // ── Template HTML Preview ──
    if (preview) {
      try {
        const { buildEmail } = require("@/lib/email/compiler");
        const templatePath = require.resolve(
          `@/lib/email/templates/${preview}`,
        );
        delete require.cache[templatePath];
        const templateMjml = require(`@/lib/email/templates/${preview}`);
        const vars = PREVIEW_VARIABLES[preview] || { name: "Test User" };
        const { html } = await buildEmail(preview, templateMjml, {
          ...vars,
          subject: `Preview: ${preview}`,
          previewText: `Preview of ${preview} email`,
        });
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      } catch (previewErr) {
        return res.json(
          { success: false, error: `Preview failed: ${previewErr.message}` },
          { status: 500 },
        );
      }
    }

    if (!userId) {
      return res.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    await connectToDB();
    const user = await User.findById(userId);
    if (!user) {
      return res.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const query = { userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const logs = await getEmailLogs(query).skip(skip).limit(limit).lean();

    const total = await EmailLog.countDocuments(query);

    return res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[AdminEmails] GET error:", error);
    return res.json(
      { success: false, message: "Failed to fetch email logs" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin(request);
    if (admin.error) return admin.error;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    if (!userId) {
      return res.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    await connectToDB();
    const user = await User.findById(userId);
    if (!user) {
      return res.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { action, jobId, templateType, testEmail } = body;

    // ── Send Test Email ──
    if (action === "test" && templateType) {
      try {
        const { buildEmail } = require("@/lib/email/compiler");
        const templatePath = require.resolve(
          `@/lib/email/templates/${templateType}`,
        );
        delete require.cache[templatePath];
        const templateMjml = require(`@/lib/email/templates/${templateType}`);
        const vars = PREVIEW_VARIABLES[templateType] || { name: user.name };
        const subject = `[TEST] ${templateType} email`;
        const { html } = await buildEmail(templateType, templateMjml, {
          ...vars,
          subject,
          previewText: `Test: ${templateType}`,
        });

        const recipient = testEmail || user.email;
        const newJobId = await enqueue({
          to: recipient,
          subject,
          html,
          type: `test-${templateType}`,
          userId,
        });
        return res.json({
          success: true,
          message: `Test email queued to ${recipient}`,
          jobId: newJobId,
        });
      } catch (testErr) {
        return res.json(
          { success: false, error: `Test email failed: ${testErr.message}` },
          { status: 500 },
        );
      }
    }

    // ── Retry Single Email ──
    if (action === "retry" && jobId) {
      const job = await retryEmail(jobId);
      if (!job) {
        return res.json(
          { success: false, message: "Email not found or not failed" },
          { status: 404 },
        );
      }

      const newJobId = await enqueue({
        to: job.to,
        subject: job.subject,
        html: job.html,
        type: job.type,
        userId: job.userId,
      });

      return res.json({
        success: true,
        message: "Email queued for retry",
        jobId: newJobId,
      });
    }

    // ── Retry All Failed ──
    if (action === "retry-all-failed") {
      const failed = await getFailedEmails();
      const retried = [];

      for (const email of failed) {
        const job = await retryEmail(email.jobId);
        if (job) {
          const newJobId = await enqueue({
            to: job.to,
            subject: job.subject,
            html: job.html,
            type: job.type,
            userId: job.userId,
          });
          retried.push(newJobId);
        }
      }

      return res.json({
        success: true,
        message: `Retried ${retried.length} failed emails`,
        retried,
      });
    }

    return res.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("[AdminEmails] POST error:", error);
    return res.json(
      { success: false, message: "Failed to process action" },
      { status: 500 },
    );
  }
}
