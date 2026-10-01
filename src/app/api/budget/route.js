import { NextResponse as res } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-service";
import { budgetSetSchema, MONTH_REGEX } from "@/lib/validation/budget";
import {
  getBudgetSummaryForUser,
  setDailyBudgetForUser,
} from "@/lib/budget/budget-service";

/**
 * Helper to obtain the current month in "YYYY-MM" UTC format.
 */
function getCurrentMonthString() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * GET /api/budget?month=YYYY-MM
 * Fetches the daily budget configuration and derived financial calculations.
 */
export async function GET(req) {
  try {
    const authResult = await getAuthenticatedUserId(req);
    if (!authResult.userId) {
      return res.json(
        { success: false, error: authResult.error || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || getCurrentMonthString();
    const todayParam = searchParams.get("today"); // optional reference date override

    if (!MONTH_REGEX.test(month)) {
      return res.json(
        { success: false, error: "Invalid month format. Expected YYYY-MM (e.g. 2026-10)" },
        { status: 400 }
      );
    }

    const referenceDate = todayParam ? new Date(todayParam) : new Date();

    const result = await getBudgetSummaryForUser({
      userId: authResult.userId,
      month,
      referenceDate,
    });

    if (!result.hasBudget) {
      return res.json(
        {
          success: true,
          hasBudget: false,
          month,
          data: null,
        },
        { status: 200 }
      );
    }

    return res.json(
      {
        success: true,
        hasBudget: true,
        month,
        data: {
          ...result.summary,
          budget: result.budget,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Budget API GET] Error:", error.message);
    return res.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/budget
 * Sets or updates (upserts) the daily budget for the authenticated user and month.
 * Body: { month: "YYYY-MM", dailyBudget: number }
 */
export async function POST(req) {
  try {
    const authResult = await getAuthenticatedUserId(req);
    if (!authResult.userId) {
      return res.json(
        { success: false, error: authResult.error || "Unauthorized" },
        { status: authResult.status || 401 }
      );
    }

    const body = await req.json();

    const { error, value } = budgetSetSchema.validate(body, { abortEarly: false });
    if (error) {
      return res.json(
        {
          success: false,
          error: error.details[0].message,
        },
        { status: 400 }
      );
    }

    const { month, dailyBudget } = value;

    const result = await setDailyBudgetForUser({
      userId: authResult.userId,
      month,
      dailyBudget,
    });

    return res.json(
      {
        success: true,
        message: "Daily budget saved successfully",
        hasBudget: true,
        month,
        data: {
          ...result.summary,
          budget: result.budget,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Budget API POST] Error:", error.message);
    return res.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/budget
 * Equivalent to POST for RESTful consistency.
 */
export async function PATCH(req) {
  return POST(req);
}
