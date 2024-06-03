import Expense from "@/models/expense";
import { connectToDB } from "@/utils/database";
import Joi from "joi";
import { NextResponse as res } from "next/server";

export async function PATCH(req, { params }) {
  const body = await req.json();
  const signupSchema = Joi.object({
    title: Joi.string().required(),
    amount: Joi.number().required(),
    expenseDate: Joi.date().required(),
    category: Joi.string().required(),
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

  const { title, amount, expenseDate, category } = body;

  const { id } = params;

  try {
    await connectToDB();
    const result = await Expense.findByIdAndUpdate(id, {
      title,
      amount,
      expenseDate,
      category,
    });
    if (!result) {
      return res.json(
        { success: false, error: "Expense not found" },
        { status: 404 }
      );
    }
    return res.json({ success: true, msg: "Expense updated" }, { status: 200 });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
