import Income from "@/models/income";
import { connectToDB } from "@/utils/database";
import { incomeUpdateSchema } from "@/lib/validation/transactions";
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
      return res.json({ success: false, error: "Income not found" }, { status: 404 });
    }

    const body = await req.json();

    const { error, value } = incomeUpdateSchema.validate(body, { abortEarly: false });
    if (error) {
      return res.json(
        { success: false, error: error.details[0].message },
        { status: 400 }
      );
    }

    const { companyName, title, amount, incomeDate, isRecurring, recurringFrequency } = value;

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

    // Scoped to the authenticated owner so one user can never update another's income.
    const result = await Income.findOneAndUpdate(
      { _id: id, user: auth.user.id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!result) {
      return res.json({ success: false, error: "Income not found" }, { status: 404 });
    }
    return res.json({ success: true, msg: "Income updated" }, { status: 200 });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
