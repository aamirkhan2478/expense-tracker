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
    isRecurring: Joi.boolean().optional(),
    recurringFrequency: Joi.string().valid("daily", "weekly", "monthly", "yearly").optional(),
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

  const { title, amount, expenseDate, category, isRecurring, recurringFrequency } = body;

  const { id } = params;

  try {
    await connectToDB();
    const updateData = {
      title,
      amount,
      expenseDate,
      category,
    };
    if (isRecurring !== undefined) {
      updateData.isRecurring = isRecurring;
      updateData.recurringFrequency = isRecurring ? recurringFrequency : null;
      updateData.lastProcessedAt = isRecurring ? expenseDate : null;
    }
    const result = await Expense.findByIdAndUpdate(id, updateData);
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
