import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import EmailSettings from "@/models/email-settings";
import { requireAdmin } from "@/lib/auth-middleware";

/**
 * GET /api/admin/emails/settings
 * Returns current global email settings.
 */
export async function GET(request) {
  try {
    const admin = await requireAdmin(request);
    if (admin.error) return admin.error;
    await connectToDB();
    let settings = await EmailSettings.findOne({}).lean();

    // Create defaults on first access
    if (!settings) {
      settings = await EmailSettings.create({});
    }

    return res.json({ success: true, settings });
  } catch (err) {
    console.error("[AdminEmailSettings] GET error:", err.message);
    return res.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/emails/settings
 * Update global email settings.
 * Body: Partial<EmailSettings>
 */
export async function POST(request) {
  try {
    const admin = await requireAdmin(request);
    if (admin.error) return admin.error;
    const body = await request.json();

    await connectToDB();
    let settings = await EmailSettings.findOne({});

    if (!settings) {
      settings = new EmailSettings(body);
    } else {
      // Deep merge enabledTemplates
      if (body.enabledTemplates) {
        settings.enabledTemplates = {
          ...(settings.enabledTemplates?.toObject?.() || settings.enabledTemplates || {}),
          ...body.enabledTemplates,
        };
      }
      if (body.largeExpenseThreshold !== undefined) settings.largeExpenseThreshold = body.largeExpenseThreshold;
      if (body.overspendingAlertThreshold !== undefined) settings.overspendingAlertThreshold = body.overspendingAlertThreshold;
      if (body.reminderSchedule !== undefined) settings.reminderSchedule = body.reminderSchedule;
      if (body.weeklySummarySchedule !== undefined) settings.weeklySummarySchedule = body.weeklySummarySchedule;
    }

    await settings.save();

    return res.json({
      success: true,
      message: "Email settings updated",
      settings: settings.toObject(),
    });
  } catch (err) {
    console.error("[AdminEmailSettings] POST error:", err.message);
    return res.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
