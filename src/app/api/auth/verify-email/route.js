import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import crypto from "crypto";

export async function POST(req) {
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
        { success: false, error: "Invalid or expired token" },
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
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
