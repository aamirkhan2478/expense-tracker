import { Schema, model, models } from "mongoose";

const ExpenseSchema = new Schema(
  {
    title: {
      type: String,
      require: [true, "Title is required"],
    },
    amount: {
      type: Number,
      require: [true, "Amount is required"],
    },
    expenseDate: {
      type: Date,
      require: [true, "Expense Date is required"],
    },
    type: {
      type: String,
      require: [true, "Type is required"],
      default: "expense",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Expense = models.Expense || model("Expense", ExpenseSchema);

export default Expense;
