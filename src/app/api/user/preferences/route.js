import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import { requireUser } from "@/lib/auth-middleware";

/**
 * GET /api/user/preferences
 * Returns the authenticated user's notification preferences.
 */
export async function GET(request) {
  try {
    await connectToDB();

    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const user = await User.findById(auth.user.id).select("notificationPreferences").lean();
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
 * Updates the authenticated user's notification preferences.
 * Body: { preferences: Partial<NotificationPreferences> }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    // The owning user is derived from the token — drop any client-supplied "user".
    const { user: _clientUser, preferences } = body;

    if (!preferences || typeof preferences !== "object") {
      return res.json({ success: false, error: "Preferences are required" }, { status: 400 });
    }

    await connectToDB();

    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const user = await User.findById(auth.user.id);
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
