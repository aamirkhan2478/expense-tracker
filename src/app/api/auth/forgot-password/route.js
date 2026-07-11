import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return res.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findOne({ email });

    if (!user) {
      return res.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    const { sendPasswordResetEmail } = require("@/lib/email");
    sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken,
      user._id.toString()
    ).catch((err) => console.error("[ForgotPassword] Email failed:", err.message));

    return res.json(
      { success: true, message: "Password reset link sent to your email" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[ForgotPassword] Error:", err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
