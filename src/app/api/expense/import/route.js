import Expense from "@/models/expense";
import User from "@/models/user";
import { connectToDB } from "@/utils/database";
import Joi from "joi";
import { NextResponse as res } from "next/server";
import Category from "@/models/category";

// @route /api/expense/import
export async function POST(req) {
  const body = await req.json();

  body.forEach((expense) => {
    const signupSchema = Joi.object({
      title: Joi.string().required(),
      amount: Joi.number().required(),
      expenseDate: Joi.date().required(),
      category: Joi.string().required(),
      user: Joi.string().required(),
    });

    const { error } = signupSchema.validate(expense, { abortEarly: false });
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
  });

  try {
    await connectToDB();

    body.forEach(async (expense) => {
      let userExist = await User.findOne({ user: expense.user });
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

      let categoryExist = await Category.findOne({ _id: expense.category });
      if (!categoryExist) {
        return res.json(
          {
            success: false,
            error: "Category not found",
          },
          {
            status: 400,
          }
        );
      }
    });

    await Expense.insertMany(body);

    return res.json(
      {
        success: true,
        msg: "Expense created",
      },
      {
        status: 201,
      }
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
