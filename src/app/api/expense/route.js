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

    // Check budget thresholds asynchronously
    const { sendBudgetWarningEmail, sendBudgetExceededEmail } = require("@/lib/email");
    const Category = require("@/models/category").default;
    
    (async () => {
      try {
        const cat = await Category.findById(category);
        if (!cat || !cat.budget || cat.budget <= 0) return;

        const now = new Date();
        const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
        const endOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59));

        const ExpenseModel = require("@/models/expense").default;
        const aggregation = await ExpenseModel.aggregate([
          {
            $match: {
              user: userExist._id,
              category: cat._id,
              expenseDate: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
        ]);

        const totalSpent = aggregation[0]?.totalSpent || 0;
        const percentage = Math.round((totalSpent / cat.budget) * 100);
        const monthName = now.toLocaleString("default", { month: "long" });

        if (percentage >= 100) {
          const overAmount = (totalSpent - cat.budget).toFixed(2);
          await sendBudgetExceededEmail(
            userExist.email,
            userExist.name,
            cat.name,
            totalSpent.toFixed(2),
            cat.budget.toFixed(2),
            overAmount,
            monthName,
            userExist._id.toString()
          );
        } else if (percentage >= 80) {
          await sendBudgetWarningEmail(
            userExist.email,
            userExist.name,
            cat.name,
            totalSpent.toFixed(2),
            cat.budget.toFixed(2),
            percentage,
            monthName,
            userExist._id.toString()
          );
        }
      } catch (budgetErr) {
        console.error("[Expense] Budget check failed:", budgetErr.message);
      }
    })();

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
