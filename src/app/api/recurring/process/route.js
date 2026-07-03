import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Income from "@/models/income";
import Expense from "@/models/expense";
import User from "@/models/user";
import mongoose from "mongoose";

function getNextDueDate(date, frequency) {
  const next = new Date(date);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

export async function POST(req) {
  const body = await req.json();
  const { user } = body;

  if (!user) {
    return res.json(
      { success: false, error: "User not found" },
      { status: 400 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    return res.json(
      { success: false, error: "Invalid user id" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();

    let userExist = await User.findOne({ user });
    if (!userExist) {
      return res.json(
        { success: false, error: "User not found" },
        { status: 400 }
      );
    }

    const now = new Date();
    const createdIncomes = [];
    const createdExpenses = [];

    // Process recurring incomes
    const recurringIncomes = await Income.find({ user, isRecurring: true });
    for (const template of recurringIncomes) {
      let lastDate = template.lastProcessedAt || template.incomeDate;
      let nextDue = getNextDueDate(lastDate, template.recurringFrequency);
      let count = 0;

      while (nextDue <= now && count < 24) {
        const newIncome = new Income({
          companyName: template.companyName,
          title: template.title,
          amount: template.amount,
          incomeDate: nextDue,
          type: "income",
          user: template.user,
          isRecurring: false,
          recurringFrequency: null,
          lastProcessedAt: null,
        });
        await newIncome.save();
        createdIncomes.push(newIncome);

        template.lastProcessedAt = nextDue;
        nextDue = getNextDueDate(nextDue, template.recurringFrequency);
        count++;
      }

      if (count > 0) {
        await template.save();
      }
    }

    // Process recurring expenses
    const recurringExpenses = await Expense.find({ user, isRecurring: true });
    for (const template of recurringExpenses) {
      let lastDate = template.lastProcessedAt || template.expenseDate;
      let nextDue = getNextDueDate(lastDate, template.recurringFrequency);
      let count = 0;

      while (nextDue <= now && count < 24) {
        const newExpense = new Expense({
          title: template.title,
          amount: template.amount,
          expenseDate: nextDue,
          type: "expense",
          category: template.category,
          user: template.user,
          isRecurring: false,
          recurringFrequency: null,
          lastProcessedAt: null,
        });
        await newExpense.save();
        createdExpenses.push(newExpense);

        template.lastProcessedAt = nextDue;
        nextDue = getNextDueDate(nextDue, template.recurringFrequency);
        count++;
      }

      if (count > 0) {
        await template.save();
      }
    }

    return res.json(
      {
        success: true,
        incomesCreated: createdIncomes.length,
        expensesCreated: createdExpenses.length,
        totalCreated: createdIncomes.length + createdExpenses.length,
        details: {
          incomes: createdIncomes.map((i) => ({
            id: i._id,
            title: i.title,
            amount: i.amount,
            date: i.incomeDate,
          })),
          expenses: createdExpenses.map((e) => ({
            id: e._id,
            title: e.title,
            amount: e.amount,
            date: e.expenseDate,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
