import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Income from "@/models/income";
import User from "@/models/user";
import mongoose from "mongoose";
import { incomeCreateSchema } from "@/lib/validation/transactions";

export async function POST(req) {
  const body = await req.json();

  const { error } = incomeCreateSchema.validate(body, { abortEarly: false });
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

  const { companyName, title, amount, incomeDate, user, isRecurring, recurringFrequency } = body;

  try {
    await connectToDB();
    let userExist = await User.findById(user);
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
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? recurringFrequency : null,
      lastProcessedAt: isRecurring ? incomeDate : null,
    });
    await income.save();
    return res.json({ success: true, msg: "Income created" }, { status: 201 });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const incomePage = searchParams.get("page");
  const incomeLimit = searchParams.get("limit");
  const incomeDate = searchParams.get("incomeDate");
  const isRecurring = searchParams.get("isRecurring") || "";

  const page = Number(incomePage) || 1;
  const limit = Number(incomeLimit) || 5;
  const startIndex = (page - 1) * limit;

  try {
    await connectToDB();

    let filter = {};
    if (incomeDate) {
      const startDate = new Date(incomeDate);
      const endDate = new Date(incomeDate);
      endDate.setMonth(endDate.getMonth() + 1);
      filter.incomeDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    if (isRecurring === "true" || isRecurring === "false") {
      filter.isRecurring = isRecurring === "true";
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

    const result = await Income.find({
      user,
      ...filter,
    })
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    const totalIncomes = await Income.countDocuments({
      user,
      ...filter,
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

    const incomes = await Income.find({ user, ...filter });
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
