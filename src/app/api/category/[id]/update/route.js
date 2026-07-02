import Category from "@/models/category";
import { connectToDB } from "@/utils/database";
import Joi from "joi";
import { NextResponse as res } from "next/server";

export async function PATCH(req, { params }) {
  const body = await req.json();
  const signupSchema = Joi.object({
    name: Joi.string().required(),
    icon: Joi.string().required(),
    budget: Joi.number().min(0).optional(),
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

  const { name, icon, budget } = body;

  const { id } = params;
  try {
    await connectToDB();
    const updateData = { name, icon };
    if (budget !== undefined) {
      updateData.budget = budget;
    }
    const result = await Category.findByIdAndUpdate(id, updateData);
    if (!result) {
      return res.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }
    return res.json(
      { success: true, msg: "Category updated" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
