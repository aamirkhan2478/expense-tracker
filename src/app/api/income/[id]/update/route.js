import Income from "@/models/income";
import { connectToDB } from "@/utils/database";
import { incomeUpdateSchema } from "@/lib/validation/transactions";
import { NextResponse as res } from "next/server";

export async function PATCH(req, { params }) {
  const body = await req.json();

  const { error } = incomeUpdateSchema.validate(body, { abortEarly: false });
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

  const { companyName, title, amount, incomeDate, isRecurring, recurringFrequency } = body;

  const { id } = params;

  try {
    await connectToDB();
    const updateData = {
      title,
      amount,
      incomeDate,
      companyName,
    };
    if (isRecurring !== undefined) {
      updateData.isRecurring = isRecurring;
      updateData.recurringFrequency = isRecurring ? recurringFrequency : null;
      updateData.lastProcessedAt = isRecurring ? incomeDate : null;
    }
    const result = await Income.findByIdAndUpdate(id, updateData);
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
