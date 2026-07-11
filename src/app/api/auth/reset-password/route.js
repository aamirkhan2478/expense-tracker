import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limiter";

export async function POST(req) {
  // ── Rate Limiting ──
  const rateLimitResult = rateLimit(req, {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: "auth:reset-password",
  });

  if (rateLimitResult) {
    return res.json(
      { success: false, error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return res.json(
        { success: false, error: "Token and password are required" },
        { status: 400 }
      );
    }

    // ── Password Validation ──
    if (password.length < 8) {
      return res.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return res.json(
        { success: false, error: "Password cannot exceed 128 characters" },
        { status: 400 }
      );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;
    if (!passwordRegex.test(password)) {
      return res.json(
        {
          success: false,
          error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
        { status: 400 }
      );
    }

    await connectToDB();

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password +refreshToken +refreshTokenExpires");

    if (!user) {
      return res.json(
        { success: false, error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    // ── Check if new password is different from old ──
    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword) {
      return res.json(
        { success: false, error: "New password must be different from your current password" },
        { status: 400 }
      );
    }

    // ── Update password and clear reset fields ──
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    // ── Invalidate all existing sessions ──
    user.refreshToken = null;
    user.refreshTokenExpires = null;
    user.loginAttempts = 0;
    user.lockUntil = null;

    await user.save();

    return res.json(
      { success: true, message: "Password reset successfully. Please sign in with your new password." },
      { status: 200 }
    );
  } catch (err) {
    console.error("[ResetPassword] Error:", err.message);
    return res.json(
      { success: false, error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
