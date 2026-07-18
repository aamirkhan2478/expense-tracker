import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Expense from "@/models/expense";
import Income from "@/models/income";

/**
 * POST /api/import
 * Accepts a JSON body with array of transaction records to bulk import.
 * Body: { user: string, records: Array<{ title, amount, date, type, category? }> }
 */
export async function POST(request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { user: userId, records } = body;

    if (!userId || !Array.isArray(records) || records.length === 0) {
      return res.json(
        { success: false, error: "User ID and a non-empty records array are required" },
        { status: 400 }
      );
    }

    await connectToDB();
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.json({ success: false, error: "User not found" }, { status: 404 });
    }

    let successCount = 0;
    let failedCount = 0;
    let duplicateCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        const { title, amount, date, type = "expense", category } = record;

        if (!title || !amount || !date) {
          errors.push(`Row ${i + 1}: Missing required fields (title, amount, date).`);
          failedCount++;
          continue;
        }

        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          errors.push(`Row ${i + 1}: Invalid amount "${amount}".`);
          failedCount++;
          continue;
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          errors.push(`Row ${i + 1}: Invalid date "${date}".`);
          failedCount++;
          continue;
        }

        if (type === "expense") {
          // Check for duplicate (same user, title, amount, date)
          const duplicate = await Expense.findOne({
            user: userId,
            title,
            amount: parsedAmount,
            expenseDate: parsedDate,
          }).lean();

          if (duplicate) {
            duplicateCount++;
            continue;
          }

          await Expense.create({
            user: userId,
            title,
            amount: parsedAmount,
            expenseDate: parsedDate,
            category: category || null,
            type: "expense",
          });
        } else if (type === "income") {
          const duplicate = await Income.findOne({
            user: userId,
            title,
            amount: parsedAmount,
            incomeDate: parsedDate,
          }).lean();

          if (duplicate) {
            duplicateCount++;
            continue;
          }

          await Income.create({
            user: userId,
            title,
            amount: parsedAmount,
            incomeDate: parsedDate,
            type: "income",
          });
        } else {
          errors.push(`Row ${i + 1}: Unknown type "${type}". Use "expense" or "income".`);
          failedCount++;
          continue;
        }

        successCount++;
      } catch (rowErr) {
        errors.push(`Row ${i + 1}: ${rowErr.message}`);
        failedCount++;
      }
    }

    const processingTimeMs = Date.now() - startTime;
    const processingTime = processingTimeMs < 1000
      ? `${processingTimeMs}ms`
      : `${(processingTimeMs / 1000).toFixed(2)}s`;

    // ── Send bulk import summary email ──
    try {
      const { sendBulkImportSummaryEmail } = require("@/lib/email");
      sendBulkImportSummaryEmail(
        userDoc.email,
        userDoc.name,
        {
          totalProcessed: records.length,
          successCount,
          failedCount,
          duplicateCount,
          processingTime,
          errors,
        },
        userId
      ).catch((err) => console.error("[Import] Summary email failed:", err.message));
    } catch (emailErr) {
      console.error("[Import] Email trigger error:", emailErr.message);
    }

    return res.json({
      success: true,
      totalProcessed: records.length,
      successCount,
      failedCount,
      duplicateCount,
      processingTime,
      errors: errors.slice(0, 20), // return first 20 errors in response
    }, { status: 200 });
  } catch (err) {
    console.error("[Import] Error:", err.message);
    return res.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
