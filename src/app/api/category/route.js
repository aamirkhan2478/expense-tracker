import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Category from "@/models/category";
import Joi from "joi";
import User from "@/models/user";
import mongoose from "mongoose";

export async function POST(req) {
  const body = await req.json();
  const signupSchema = Joi.object({
    name: Joi.string().required(),
    icon: Joi.string().required(),
    user: Joi.string().required(),
  });

  const { error } = signupSchema.validate(body, { abortEarly: false });
  if (error) {
    return res.json(
      {
        success: false,
        error: error.details[0].message,
      },
      {
        status: 400,
      }
    );
  }

  const { name, icon, user } = body;

  try {
    await connectToDB();
    let userExist = await User.findOne({ user });
    if (!userExist) {
      return res.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 400,
        }
      );
    }
    const category = new Category({
      name,
      icon,
      user,
    });
    await category.save();
    return res.json(
      { success: true, msg: "Category created" },
      { status: 201 }
    );
  } catch (err) {
    console.log(err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  let user = searchParams.get("user");
  try {
    await connectToDB();
    let userExist = await User.findOne({ user });
    if (!userExist) {
      return res.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 400,
        }
      );
    }
    const categories = await Category.find({ user });
    return res.json({ success: true, categories });
  } catch (err) {
    console.log(err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
