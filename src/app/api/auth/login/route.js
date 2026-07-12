import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import { rateLimit } from "@/lib/rate-limiter";
import { normalizeEmail } from "@/lib/auth-service";

/**
 * Cookie settings optimized for production reliability.
 * SameSite=Lax is more compatible than Strict while still secure.
 * Both HttpOnly and regular cookies are set for maximum compatibility.
 */
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
  // ── Rate Limiting ──
  const rateLimitResult = rateLimit(req, {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
    keyPrefix: "auth:login",
  });

  if (rateLimitResult) {
    return res.json(
      { success: false, error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email, password, rememberMe } = body;

    // ── Input Validation ──
    if (!email || !password) {
      return res.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    await connectToDB();

    // ── Find user (include password and lockout fields) ──
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password +loginAttempts +lockUntil +refreshToken +refreshTokenExpires"
    );

    if (!user) {
      return res.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ── Check if account is locked ──
    if (user.isLocked) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.json(
        {
          success: false,
          error: `Account temporarily locked due to too many failed attempts. Please try again in ${lockTime} minute(s).`,
        },
        { status: 423 }
      );
    }

    // ── Verify password ──
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incrementLoginAttempts();

      const headers = req.headers;
      const forwardedFor = headers.get("x-forwarded-for");
      const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "Unknown";
      const userAgent = headers.get("user-agent") || "Unknown";
      const timestamp = new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const { sendFailedLoginAlert } = require("@/lib/email");
      sendFailedLoginAlert(
        user.email,
        user.name,
        timestamp,
        ipAddress,
        userAgent,
        user._id.toString()
      ).catch((err) => console.error("[Auth] Failed login alert failed:", err.message));

      return res.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ── Check if email is verified ──
    if (!user.emailVerified) {
      return res.json(
        {
          success: false,
          error: "Please verify your email before logging in. Check your inbox for the verification link.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      );
    }

    // ── Reset login attempts on success ──
    await user.resetLoginAttempts();

    // ── Generate tokens ──
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await user.save({ validateBeforeSave: false });

    // ── Return response ──
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    };

    const response = res.json(
      {
        success: true,
        message: "Login successful",
        user: userData,
        token: accessToken,
        refreshToken,
      },
      { status: 200 }
    );

    // ── Set cookies ──
    // We set TWO cookies for maximum production reliability:
    // 1. "token" (HttpOnly) — secure, can't be stolen by XSS
    // 2. "_token" (regular) — accessible to middleware AND client JS
    //
    // Why both? In some production environments (Vercel Edge, proxies),
    // HttpOnly cookies may not be readable by middleware. The regular
    // cookie serves as a reliable fallback.
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    response.cookies.set("token", accessToken, getCookieOptions(maxAge));
    response.cookies.set("_token", accessToken, getRegularCookieOptions(maxAge));

    return response;
  } catch (err) {
    console.error("[Auth Login] Error:", err.message);
    return res.json(
      { success: false, error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
