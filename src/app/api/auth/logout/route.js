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

    if (token) {
      await connectToDB();
      const { valid, payload } = await verifyToken(token);

      if (valid && payload?.id) {
        await blacklistToken(token, payload.id, "logout");
        const user = await User.findById(payload.id).select(
          "+refreshToken +refreshTokenExpires"
        );
        if (user) {
          user.refreshToken = null;
          user.refreshTokenExpires = null;
          await user.save({ validateBeforeSave: false });
        }
      }
    }

    const response = res.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear ALL auth cookies (both HttpOnly and regular)
    const cookieOptions = { path: "/", maxAge: 0 };
    response.cookies.set("token", "", cookieOptions);
    response.cookies.set("_token", "", cookieOptions);

    return response;
  } catch (err) {
    console.error("[Auth Logout] Error:", err.message);
    return res.json(
      { success: false, error: "Server error during logout" },
      { status: 500 }
    );
  }
}
