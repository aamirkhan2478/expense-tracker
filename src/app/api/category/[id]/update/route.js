import Category from "@/models/category";
import { connectToDB } from "@/utils/database";
import Joi from "joi";
import { requireUser } from "@/lib/auth-middleware";
import { NextResponse as res } from "next/server";
import mongoose from "mongoose";

export async function PATCH(req, { params }) {
  const { id } = params;

  try {
    await connectToDB();

    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const body = await req.json();
    const categorySchema = Joi.object({
      name: Joi.string().trim().max(100).required(),
      icon: Joi.string().trim().max(100).required(),
      budget: Joi.number().min(0).max(1e12).optional(),
    });

    const { error, value } = categorySchema.validate(body, { abortEarly: false });
    if (error) {
      return res.json(
        { success: false, error: error.details[0].message },
        { status: 400 }
      );
    }

    const { name, icon, budget } = value;

    const updateData = { name, icon };
    if (budget !== undefined) {
      updateData.budget = budget;
    }

    // Scoped to the authenticated owner so one user can never update another's category.
    const result = await Category.findOneAndUpdate(
      { _id: id, user: auth.user.id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!result) {
      return res.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    return res.json({ success: true, msg: "Category updated" }, { status: 200 });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
