import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Category from "@/models/category";
import { requireUser } from "@/lib/auth-middleware";
import mongoose from "mongoose";

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await connectToDB();

    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    // Scoped to the authenticated owner so one user can never delete another's category.
    const result = await Category.findOneAndDelete({ _id: id, user: auth.user.id });
    if (!result) {
      return res.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    return res.json({ success: true, msg: "Category deleted" }, { status: 200 });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
