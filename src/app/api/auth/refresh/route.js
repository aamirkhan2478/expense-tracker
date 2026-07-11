import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import jwt from "jsonwebtoken";
import { rateLimit } from "@/lib/rate-limiter";

export async function POST(req) {
  // ── Rate Limiting ──
  const rateLimitResult = rateLimit(req, {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
    keyPrefix: "auth:refresh",
  });

  if (rateLimitResult) {
    return res.json(
      { success: false, error: "Too many refresh attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return res.json(
        { success: false, error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Verify refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET, {
        issuer: "spendwise",
        audience: "spendwise-client",
      });
    } catch (err) {
      return res.json(
        { success: false, error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    if (payload.type !== "refresh") {
      return res.json(
        { success: false, error: "Invalid token type" },
        { status: 401 }
      );
    }

    await connectToDB();

    const user = await User.findById(payload.id).select(
      "+refreshToken +refreshTokenExpires"
    );

    if (!user) {
      return res.json(
        { success: false, error: "User not found" },
        { status: 401 }
      );
    }

    // Check if refresh token matches and hasn't expired
    if (user.refreshToken !== refreshToken || !user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
      return res.json(
        { success: false, error: "Refresh token has been revoked" },
        { status: 401 }
      );
    }

    // Generate new tokens
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    await user.save({ validateBeforeSave: false });

    const response = res.json(
      {
        success: true,
        message: "Token refreshed successfully",
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
      { status: 200 }
    );

    // Update HTTP-only cookie
    response.cookies.set("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[Auth Refresh] Error:", err.message);
    return res.json(
      { success: false, error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
