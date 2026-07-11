import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import { rateLimit } from "@/lib/rate-limiter";
import { normalizeEmail } from "@/lib/auth-service";

export async function POST(req) {
  // ── Rate Limiting ──
  const rateLimitResult = rateLimit(req, {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: "auth:login",
  });

  if (rateLimitResult) {
    return res.json(
      {
        success: false,
        error: "Too many login attempts. Please try again later.",
      },
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
      // Generic error to prevent email enumeration
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
      // Increment failed login attempts
      await user.incrementLoginAttempts();

      // Send failed login alert asynchronously
      const headers = req.headers;
      const forwardedFor = headers.get("x-forwarded-for");
      const ipAddress = forwardedFor
        ? forwardedFor.split(",")[0].trim()
        : "Unknown";
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
      ).catch((err) =>
        console.error("[Auth] Failed login alert failed:", err.message)
      );

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

    // Set HTTP-only cookie for the token
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 24 hours
    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[Auth Login] Error:", err.message);
    return res.json(
      { success: false, error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
