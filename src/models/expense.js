import { Schema, model, models } from "mongoose";
import Category from "./category";
import User from "./user";

const CategoryModel = models.Category || model("Category", Category.schema);
const UserModel = models.User || model("User", User.schema);

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
    category: {
      type: Schema.Types.ObjectId,
      ref: CategoryModel.modelName,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: null,
    },
    lastProcessedAt: {
      type: Date,
      default: null,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: UserModel.modelName,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = models.Expense || model("Expense", ExpenseSchema);

export default Expense;
