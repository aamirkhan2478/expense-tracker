import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";

/**
 * GET /api/user/preferences
 * Returns the current user's notification preferences.
 * Query: ?user=<userId>
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    if (!userId) {
      return res.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    await connectToDB();
    const user = await User.findById(userId).select("notificationPreferences").lean();
    if (!user) {
      return res.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return res.json({
      success: true,
      preferences: user.notificationPreferences || {},
    });
  } catch (err) {
    console.error("[UserPreferences] GET error:", err.message);
    return res.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/user/preferences
 * Updates the current user's notification preferences.
 * Body: { user: string, preferences: Partial<NotificationPreferences> }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { user: userId, preferences } = body;

    if (!userId || !preferences) {
      return res.json({ success: false, error: "User ID and preferences are required" }, { status: 400 });
    }

    await connectToDB();
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Merge preferences (partial update)
    const current = user.notificationPreferences?.toObject?.() || user.notificationPreferences || {};
    user.notificationPreferences = { ...current, ...preferences };
    await user.save({ validateBeforeSave: false });

    return res.json({
      success: true,
      message: "Notification preferences updated",
      preferences: user.notificationPreferences,
    });
  } catch (err) {
    console.error("[UserPreferences] POST error:", err.message);
    return res.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
