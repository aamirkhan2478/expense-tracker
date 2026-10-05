import { Schema, model, models } from "mongoose";

const IncomeSchema = new Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
    },
    incomeDate: {
      type: Date,
      required: [true, "Income Date is required"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      default: "income",
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
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

IncomeSchema.index({ user: 1, incomeDate: 1 });

const Income = models.Income || model("Income", IncomeSchema);

export default Income;
