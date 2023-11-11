import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Income from "@/models/income";
import Joi from "joi";
import User from "@/models/user";

export async function POST(req) {
  const body = await req.json();
  const signupSchema = Joi.object({
    companyName: Joi.string().required(),
    title: Joi.string().required(),
    amount: Joi.number().required(),
    incomeDate: Joi.date().required(),
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

  const {companyName, title, amount, incomeDate, user } = body;

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
    const income = new Income({
      companyName,
      title,
      amount,
      incomeDate,
      user,
    });
    await income.save();
    return res.json({ success: true, msg: "Income created" }, { status: 201 });
  } catch (error) {
    console.log(err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const incomePage = searchParams.get("page");
  const incomeLimit = searchParams.get("limit");
  const incomeDate = searchParams.get("incomeDate");

  // Pagination Logic
  const page = Number(incomePage) || 1;
  const limit = Number(incomeLimit) || 5;
  const startIndex = (page - 1) * limit;

  try {
    await connectToDB();

    let dateFilter = {};
    if (incomeDate) {
      dateFilter.incomeDate = new Date(incomeDate);
    }

    const result = await Income.find({
      user,
      ...dateFilter,
    })
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    const totalIncomes = await Income.countDocuments({
      user,
      ...dateFilter,
    });

    const endIndex = Math.min(startIndex + limit, totalIncomes);

    const pagination = {};

    if (endIndex < totalIncomes) {
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

    // Calculate the total income amount
    const incomes = await Income.find({ user });
    let totalAmount = 0;
    incomes.forEach((income) => {
      totalAmount += income.amount;
    });

    return res.json(
      {
        success: true,
        data: result,
        page,
        totalIncomes,
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
