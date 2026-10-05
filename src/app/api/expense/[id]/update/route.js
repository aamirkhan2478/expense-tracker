import Expense from "@/models/expense";
import Category from "@/models/category";
import { connectToDB } from "@/utils/database";
import { expenseUpdateSchema } from "@/lib/validation/transactions";
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
      return res.json({ success: false, error: "Expense not found" }, { status: 404 });
    }

    const body = await req.json();

    const { error, value } = expenseUpdateSchema.validate(body, { abortEarly: false });
    if (error) {
      return res.json(
        { success: false, error: error.details[0].message },
        { status: 400 }
      );
    }

    const { title, amount, expenseDate, category, isRecurring, recurringFrequency, includeInBudget } = value;

    // The category must belong to the authenticated user.
    const ownedCategory = await Category.findOne({ _id: category, user: auth.user.id }).select("_id").lean();
    if (!ownedCategory) {
      return res.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const updateData = {
      title,
      amount,
      expenseDate,
      category,
      includeInBudget: includeInBudget || false,
    };
    if (isRecurring !== undefined) {
      updateData.isRecurring = isRecurring;
      updateData.recurringFrequency = isRecurring ? recurringFrequency : null;
      updateData.lastProcessedAt = isRecurring ? expenseDate : null;
    }

    // Scoped to the authenticated owner so one user can never update another's expense.
    const result = await Expense.findOneAndUpdate(
      { _id: id, user: auth.user.id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!result) {
      return res.json({ success: false, error: "Expense not found" }, { status: 404 });
    }
    return res.json({ success: true, msg: "Expense updated" }, { status: 200 });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
