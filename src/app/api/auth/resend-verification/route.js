import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import { rateLimit } from "@/lib/rate-limiter";
import { normalizeEmail } from "@/lib/auth-service";

export async function POST(req) {
  // ── Rate Limiting ──
  const rateLimitResult = rateLimit(req, {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: "auth:resend-verification",
  });

  if (rateLimitResult) {
    return res.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return res.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    await connectToDB();

    const user = await User.findOne({ email: normalizedEmail });

    // Always return same message to prevent email enumeration
    if (!user || user.emailVerified) {
      return res.json(
        {
          success: true,
          message: "If an unverified account exists with this email, a new verification link has been sent.",
        },
        { status: 200 }
      );
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email asynchronously
    const { sendVerificationEmail } = require("@/lib/email");
    sendVerificationEmail(
      user.email,
      user.name,
      verificationToken,
      user._id.toString()
    ).catch((err) =>
      console.error("[ResendVerification] Email failed:", err.message)
    );

    return res.json(
      {
        success: true,
        message: "If an unverified account exists with this email, a new verification link has been sent.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[ResendVerification] Error:", err.message);
    return res.json(
      { success: false, error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
