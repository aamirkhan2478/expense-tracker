import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Category from "@/models/category";
import Joi from "joi";
import { requireUser } from "@/lib/auth-middleware";

export async function POST(req) {
  try {
    await connectToDB();

    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    const userId = auth.user.id;

    const body = await req.json();
    // The owning user is derived from the token — drop any client-supplied "user".
    const { user: _clientUser, ...payload } = body;

    const categorySchema = Joi.object({
      name: Joi.string().trim().max(100).required(),
      icon: Joi.string().trim().max(100).required(),
      budget: Joi.number().min(0).max(1e12).optional(),
    });

    const { error, value } = categorySchema.validate(payload, { abortEarly: false });
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

    const { name, icon, budget } = value;

    const category = new Category({
      name,
      icon,
      user: userId,
      budget: budget || 0,
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
  try {
    await connectToDB();

    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    const categories = await Category.find({ user: auth.user.id });
    return res.json({ success: true, categories });
  } catch (err) {
    console.log(err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
