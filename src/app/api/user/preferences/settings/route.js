import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";

const VALID_DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD MMM YYYY", "MMM DD, YYYY", "DD-MM-YYYY", "YYYY/MM/DD"];
const VALID_ITEMS_PER_PAGE = [10, 25, 50, 100];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    if (!userId) {
      return res.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    await connectToDB();
    const user = await User.findById(userId).select("preferences").lean();
    if (!user) {
      return res.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return res.json({
      success: true,
      preferences: user.preferences || { dateFormat: "MM/DD/YYYY", itemsPerPage: 10 },
    });
  } catch (err) {
    console.error("[UserPreferences/Settings] GET error:", err.message);
    return res.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user: userId, preferences } = body;

    if (!userId || !preferences) {
      return res.json({ success: false, error: "User ID and preferences are required" }, { status: 400 });
    }

    const update = {};
    if (preferences.dateFormat !== undefined) {
      if (!VALID_DATE_FORMATS.includes(preferences.dateFormat)) {
        return res.json({ success: false, error: "Invalid date format" }, { status: 400 });
      }
      update["preferences.dateFormat"] = preferences.dateFormat;
    }
    if (preferences.itemsPerPage !== undefined) {
      if (!VALID_ITEMS_PER_PAGE.includes(preferences.itemsPerPage)) {
        return res.json({ success: false, error: "Invalid items per page value" }, { status: 400 });
      }
      update["preferences.itemsPerPage"] = preferences.itemsPerPage;
    }

    if (Object.keys(update).length === 0) {
      return res.json({ success: false, error: "No valid preferences to update" }, { status: 400 });
    }

    await connectToDB();
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, select: "preferences" }
    );

    if (!user) {
      return res.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return res.json({
      success: true,
      message: "Preferences updated",
      preferences: user.preferences,
    });
  } catch (err) {
    console.error("[UserPreferences/Settings] POST error:", err.message);
    return res.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
