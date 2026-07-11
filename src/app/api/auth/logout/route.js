import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import { verifyToken, blacklistToken } from "@/lib/auth-service";
import User from "@/models/user";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.json(
        { success: false, error: "No token provided" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Verify and get payload
    const { valid, payload } = await verifyToken(token);

    if (valid && payload?.id) {
      // Blacklist the access token
      await blacklistToken(token, payload.id, "logout");

      // Invalidate refresh token on the user
      const user = await User.findById(payload.id).select(
        "+refreshToken +refreshTokenExpires"
      );
      if (user) {
        user.refreshToken = null;
        user.refreshTokenExpires = null;
        await user.save({ validateBeforeSave: false });
      }
    }

    // Clear the HTTP-only cookie
    const response = res.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[Auth Logout] Error:", err.message);
    return res.json(
      { success: false, error: "Server error during logout" },
      { status: 500 }
    );
  }
}
