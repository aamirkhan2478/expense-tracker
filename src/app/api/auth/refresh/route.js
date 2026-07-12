import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import jwt from "jsonwebtoken";
import { rateLimit } from "@/lib/rate-limiter";

function getCookieOptions(maxAge) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge,
    path: "/",
  };
}

function getRegularCookieOptions(maxAge) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    maxAge,
    path: "/",
  };
}

export async function POST(req) {
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

    if (user.refreshToken !== refreshToken || !user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
      return res.json(
        { success: false, error: "Refresh token has been revoked" },
        { status: 401 }
      );
    }

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

    // Update both cookies
    const maxAge = 24 * 60 * 60;
    response.cookies.set("token", newAccessToken, getCookieOptions(maxAge));
    response.cookies.set("_token", newAccessToken, getRegularCookieOptions(maxAge));

    return response;
  } catch (err) {
    console.error("[Auth Refresh] Error:", err.message);
    return res.json(
      { success: false, error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
