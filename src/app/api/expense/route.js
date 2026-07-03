import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import mongoose from "mongoose";
import User from "@/models/user";
import Expense from "@/models/expense";
import Joi from "joi";

export async function POST(req) {
  const body = await req.json();
  const signupSchema = Joi.object({
    title: Joi.string().required(),
    amount: Joi.number().required(),
    expenseDate: Joi.date().required(),
    category: Joi.string().required(),
    user: Joi.string().required(),
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

  const { title, amount, expenseDate, category, user, isRecurring, recurringFrequency } = body;

  try {
    await connectToDB();
    let userExist = await User.findOne({ user });
    if (!userExist) {
      return res.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 400,
        }
      );
    }
    const expense = new Expense({
      title,
      amount,
      expenseDate,
      category,
      user,
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? recurringFrequency : null,
      lastProcessedAt: isRecurring ? expenseDate : null,
    });
    await expense.save();
    return res.json({ success: true, msg: "Expense created" }, { status: 201 });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const expensePage = searchParams.get("page");
  const expenseLimit = searchParams.get("limit");
  const category = searchParams.get("category") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const searchQuery = searchParams.get("searchQuery") || "";

  const page = Number(expensePage) || 1;
  const limit = Number(expenseLimit) || 5;
  const startIndex = (page - 1) * limit;

  try {
    await connectToDB();

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (startDate && endDate) {
      filter.expenseDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    if (searchQuery) {
      filter.title = new RegExp(searchQuery, "i");
    }

    if (!user) {
      return res.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 400,
        }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.json(
        {
          success: false,
          error: "Invalid user id",
        },
        {
          status: 400,
        }
      );
    }

    const result = await Expense.find({
      user,
      ...filter,
    })
      .sort("-expenseDate")
      .skip(startIndex)
      .limit(limit)
      .populate("category", "name icon");

    const totalExpenses = await Expense.countDocuments({
      user,
      ...filter,
    });

    const endIndex = Math.min(startIndex + limit, totalExpenses);

    const pagination = {};

    if (endIndex < totalExpenses) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      pagination.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    const filteredExpenses = await Expense.find({ user, ...filter });
    let totalAmount = 0;
    filteredExpenses.forEach((expense) => {
      totalAmount += expense.amount;
    });

    return res.json(
      {
        success: true,
        data: result,
        page,
        totalExpenses,
        totalAmount,
        pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
