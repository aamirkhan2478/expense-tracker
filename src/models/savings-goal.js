import { Schema, model, models } from "mongoose";

const SavingsGoalSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Goal name is required"],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [1, "Target amount must be positive"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    // Tracks the last milestone percent reached (0, 25, 50, 75, 100)
    lastMilestoneReached: {
      type: Number,
      enum: [0, 25, 50, 75, 100],
      default: 0,
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Virtual: progress percentage
SavingsGoalSchema.virtual("progressPercent").get(function () {
  if (!this.targetAmount || this.targetAmount <= 0) return 0;
  return Math.min(Math.round((this.currentAmount / this.targetAmount) * 100), 100);
});

SavingsGoalSchema.set("toJSON", { virtuals: true });

const SavingsGoal = models.SavingsGoal || model("SavingsGoal", SavingsGoalSchema);

export default SavingsGoal;
