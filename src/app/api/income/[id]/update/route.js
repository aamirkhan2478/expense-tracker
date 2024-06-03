import Income from "@/models/income";
import { connectToDB } from "@/utils/database";
import Joi from "joi";
import { NextResponse as res } from "next/server";

export async function PATCH(req, { params }) {
  const body = await req.json();
  const signupSchema = Joi.object({
    companyName: Joi.string().required(),
    title: Joi.string().required(),
    amount: Joi.number().required(),
    incomeDate: Joi.date().required(),
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

  const { companyName, title, amount, incomeDate } = body;

  const { id } = params;

  try {
    await connectToDB();
    const result = await Income.findByIdAndUpdate(id, {
      title,
      amount,
      incomeDate,
      companyName,
    });
    if (!result) {
      return res.json(
        { success: false, error: "Income not found" },
        { status: 404 }
      );
    }
    return res.json({ success: true, msg: "Income updated" }, { status: 200 });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
