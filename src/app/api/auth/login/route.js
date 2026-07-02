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
