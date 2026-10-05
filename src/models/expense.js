import { Schema, model, models } from "mongoose";
import Category from "./category";
import User from "./user";

const CategoryModel = models.Category || model("Category", Category.schema);
const UserModel = models.User || model("User", User.schema);

const ExpenseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },
    expenseDate: {
      type: Date,
      required: [true, "Expense Date is required"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
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
    includeInBudget: {
      type: Boolean,
      default: false,
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

ExpenseSchema.index({ user: 1, expenseDate: 1 });

const Expense = models.Expense || model("Expense", ExpenseSchema);

export default Expense;
