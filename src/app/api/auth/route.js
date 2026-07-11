import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import Joi from "joi";
import { rateLimit } from "@/lib/rate-limiter";
import { normalizeEmail, sanitizeInput } from "@/lib/auth-service";

export async function POST(req) {
  // ── Rate Limiting ──
  const rateLimitResult = rateLimit(req, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: "auth:register",
  });

  if (rateLimitResult) {
    return res.json(
      {
        success: false,
        error: "Too many registration attempts. Please try again later.",
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // ── Input Validation ──
    const signupSchema = Joi.object({
      name: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s'-]+$/)
        .required()
        .messages({
          "string.min": "Name must be at least 2 characters",
          "string.max": "Name cannot exceed 50 characters",
          "string.pattern.base": "Name can only contain letters, spaces, hyphens, and apostrophes",
          "any.required": "Name is required",
        }),
      email: Joi.string()
        .email()
        .max(255)
        .required()
        .messages({
          "string.email": "Please enter a valid email address",
          "string.max": "Email is too long",
          "any.required": "Email is required",
        }),
      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/)
        .required()
        .messages({
          "string.min": "Password must be at least 8 characters",
          "string.max": "Password cannot exceed 128 characters",
          "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          "any.required": "Password is required",
        }),
    });

    const { error, value } = signupSchema.validate(body, { abortEarly: false });
    if (error) {
      return res.json(
        { success: false, error: error.details[0].message },
        { status: 400 }
      );
    }

    // ── Sanitize & Normalize ──
    const name = sanitizeInput(value.name);
    const email = normalizeEmail(value.email);
    const { password } = value;

    await connectToDB();

    // ── Check for existing user ──
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Return same message to prevent email enumeration
      return res.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // ── Create user ──
    const user = new User({
      name,
      email,
      password,
    });

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // ── Generate tokens ──
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await user.save({ validateBeforeSave: false });

    // ── Send emails asynchronously (don't block response) ──
    const { sendWelcomeEmail, sendVerificationEmail } = require("@/lib/email");
    sendWelcomeEmail(email, name, user._id.toString()).catch((err) =>
      console.error("[Auth] Welcome email failed:", err.message)
    );
    sendVerificationEmail(email, name, verificationToken, user._id.toString()).catch((err) =>
      console.error("[Auth] Verification email failed:", err.message)
    );

    // ── Return response ──
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    };

    return res.json(
      {
        success: true,
        message: "Account created successfully. Please verify your email.",
        user: userData,
        token: accessToken,
        refreshToken,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[Auth Register] Error:", err.message);
    return res.json(
      { success: false, error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
