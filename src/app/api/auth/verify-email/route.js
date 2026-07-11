import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limiter";

export async function POST(req) {
  // ── Rate Limiting ──
  const rateLimitResult = rateLimit(req, {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: "auth:verify-email",
  });

  if (rateLimitResult) {
    return res.json(
      { success: false, error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return res.json(
        { success: false, error: "Verification token is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json(
        { success: false, error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.json(
      { success: true, message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[VerifyEmail] Error:", err.message);
    return res.json(
      { success: false, error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
