import Income from "@/models/income";
import { connectToDB } from "@/utils/database";
import { NextResponse as res } from "next/server";
export async function DELETE(_req, { params }) {
  const { id } = params;
  try {
    await connectToDB();
    const result = await Income.findByIdAndDelete(id);
    if (!result) {
      return res.json(
        { success: false, error: "Income not found" },
        { status: 404 }
      );
    }
    return res.json({ success: true, msg: "Income deleted" }, { status: 200 });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
