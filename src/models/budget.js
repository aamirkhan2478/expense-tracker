import { Schema, model, models } from "mongoose";

const BudgetSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    month: {
      type: String,
      required: [true, "Month is required in YYYY-MM format"],
      trim: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format"],
    },
    dailyBudget: {
      type: Number,
      required: [true, "Daily budget is required"],
      min: [0.01, "Daily budget must be greater than zero"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one budget per user per month
BudgetSchema.index({ user: 1, month: 1 }, { unique: true });

// Virtual for userId compatibility
BudgetSchema.virtual("userId").get(function () {
  return this.user;
});

BudgetSchema.set("toJSON", { virtuals: true });
BudgetSchema.set("toObject", { virtuals: true });

const Budget = models.Budget || model("Budget", BudgetSchema);

export default Budget;
