import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Expense from "@/models/expense";
import Joi from "joi";
import User from "@/models/user";
import mongoose from "mongoose";

export async function POST(req) {
  const body = await req.json();
  const signupSchema = Joi.object({
    title: Joi.string().required(),
    amount: Joi.number().required(),
    expenseDate: Joi.date().required(),
    user: Joi.string().required(),
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

  const { title, amount, expenseDate, user } = body;

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
      user,
    });
    await expense.save();
    return res.json({ success: true, msg: "Expense created" }, { status: 201 });
  } catch (error) {
    console.log(err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  let user = searchParams.get("user");
  const expensePage = searchParams.get("page");
  const expenseLimit = searchParams.get("limit");
  const expenseDate = searchParams.get("expenseDate");

  // Pagination Logic
  const page = Number(expensePage) || 1;
  const limit = Number(expenseLimit) || 5;
  const startIndex = (page - 1) * limit;

  try {
    await connectToDB();

    let dateFilter = {};
    if (expenseDate) {
      dateFilter.expenseDate = new Date(expenseDate);
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
      ...dateFilter,
    })
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    const totalExpenses = await Expense.countDocuments({
      user,
      ...dateFilter,
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

    // Calculate the total expense amount
    const expenses = await Expense.find({ user });
    let totalAmount = 0;
    expenses.forEach((expense) => {
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
