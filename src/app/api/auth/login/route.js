import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";

export async function POST(req) {
  const body = await req.json();

  const { email, password } = body;

  try {
    await connectToDB();

    const user = await User.findOne({ email });

    if (!user) {
      return res.json(
        {
          success: false,
          error: "Invalid Credentials",
        },
        {
          status: 400,
        },
      );
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Send failed login alert asynchronously
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
        {
          success: false,
          error: "Invalid Credentials",
        },
        {
          status: 400,
        },
      );
    }

    const token = user.generateToken();

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    return res.json(
      {
        success: true,
        msg: "User logged in Successfully",
        user: userData,
        token,
      },
      {
        status: 201,
      },
    );
  } catch (err) {
    console.log(err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
