import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import crypto from "crypto";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return res.json(
        { success: false, error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return res.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectToDB();

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json(
        { success: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[ResetPassword] Error:", err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
