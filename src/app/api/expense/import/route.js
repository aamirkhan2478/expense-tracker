import Expense from "@/models/expense";
import Category from "@/models/category";
import { connectToDB } from "@/utils/database";
import Joi from "joi";
import { requireUser } from "@/lib/auth-middleware";
import { NextResponse as res } from "next/server";

const MAX_IMPORT_ROWS = 5000;

const importRowSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  amount: Joi.number().min(0.01, "Amount must be greater than zero").max(1e12).required(),
  expenseDate: Joi.date().required(),
  category: Joi.string().required(),
});

// @route /api/expense/import
export async function POST(req) {
  try {
    await connectToDB();

    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    const userId = auth.user.id;

    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return res.json(
        { success: false, error: "A non-empty array of expenses is required" },
        { status: 400 }
      );
    }

    if (body.length > MAX_IMPORT_ROWS) {
      return res.json(
        { success: false, error: `Import is limited to ${MAX_IMPORT_ROWS} rows at a time` },
        { status: 400 }
      );
    }

    // Validate every row up front and report all failures at once.
    const errors = [];
    const rows = [];

    body.forEach((expense, index) => {
      // The owning user is server-derived — drop any client-supplied "user".
      const { user: _clientUser, ...payload } = expense;

      const { error, value } = importRowSchema.validate(payload, { abortEarly: false });
      if (error) {
        errors.push(`Row ${index + 1}: ${error.details[0].message}`);
        return;
      }
      rows.push(value);
    });

    if (errors.length > 0) {
      return res.json(
        { success: false, error: errors[0], errors: errors.slice(0, 20) },
        { status: 400 }
      );
    }

    // Every referenced category must belong to the authenticated user.
    const categoryIds = [...new Set(rows.map((row) => row.category))];
    const ownedCategories = await Category.find({ _id: { $in: categoryIds }, user: userId })
      .select("_id")
      .lean();
    const ownedIds = new Set(ownedCategories.map((cat) => cat._id.toString()));

    const foreign = categoryIds.filter((id) => !ownedIds.has(id));
    if (foreign.length > 0) {
      return res.json(
        { success: false, error: "One or more categories do not belong to you" },
        { status: 403 }
      );
    }

    // Stamp the authenticated owner onto every row.
    const docs = rows.map((row) => ({ ...row, user: userId, type: "expense" }));
    const inserted = await Expense.insertMany(docs);

    return res.json(
      {
        success: true,
        msg: "Expenses imported",
        imported: inserted.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error.message);
    return res.json(
      {
        error: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
