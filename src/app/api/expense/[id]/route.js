import Expense from "@/models/expense";
import { connectToDB } from "@/utils/database";
import { NextResponse as res } from "next/server";
export async function DELETE(_req, { params }) {
  const { id } = params;
  try {
    await connectToDB();
    const result = await Expense.findByIdAndDelete(id);
    if (!result) {
      return res.json(
        { success: false, error: "Expense not found" },
        { status: 404 }
      );
    }
    return res.json({ success: true, msg: "Expense deleted" }, { status: 200 });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
