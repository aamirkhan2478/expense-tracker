import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import mongoose from "mongoose";
import SavingsGoal from "@/models/savings-goal";
import User from "@/models/user";

const MILESTONE_THRESHOLDS = [25, 50, 75, 100];

/**
 * GET /api/savings-goals?user=<userId>
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ success: false, error: "Valid User ID is required" }, { status: 400 });
    }

    await connectToDB();
    const goals = await SavingsGoal.find({ user: userId }).sort("-createdAt").lean();

    // Compute progress percentages
    const goalsWithProgress = goals.map((g) => ({
      ...g,
      progressPercent: g.targetAmount > 0
        ? Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100)
        : 0,
    }));

    return res.json({ success: true, goals: goalsWithProgress });
  } catch (err) {
    console.error("[SavingsGoals] GET error:", err.message);
    return res.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/savings-goals
 * Create a new goal or update progress on an existing goal.
 * Body: { user, name, targetAmount, currentAmount?, targetDate?, notes?, goalId? }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { user: userId, goalId, ...fields } = body;

    if (!userId) {
      return res.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    await connectToDB();
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.json({ success: false, error: "User not found" }, { status: 404 });
    }

    let goal;

    if (goalId) {
      // Update existing goal
      goal = await SavingsGoal.findOne({ _id: goalId, user: userId });
      if (!goal) {
        return res.json({ success: false, error: "Goal not found" }, { status: 404 });
      }

      const prevProgress = goal.targetAmount > 0
        ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
        : 0;

      Object.assign(goal, fields);
      if (goal.currentAmount >= goal.targetAmount) goal.isCompleted = true;
      await goal.save();

      // Check for new milestone
      const newProgress = goal.targetAmount > 0
        ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
        : 0;

      const lastMilestone = goal.lastMilestoneReached || 0;
      const newMilestone = MILESTONE_THRESHOLDS.find(
        (m) => newProgress >= m && prevProgress < m && m > lastMilestone
      );

      if (newMilestone) {
        goal.lastMilestoneReached = newMilestone;
        await goal.save();

        // Trigger savings milestone email
        try {
          const { sendSavingsMilestoneEmail } = require("@/lib/email");
          const milestoneNames = { 25: "25% Saved 🌱", 50: "Halfway There! 🚀", 75: "75% Achieved 🏆", 100: "Goal Complete! 🎉" };
          const encouragingMessages = {
            25: "Great start! You've saved a quarter of your goal. Keep the momentum going!",
            50: "Incredible! You're halfway to your goal. Your discipline is paying off.",
            75: "Almost there! You've saved 75% of your goal. The finish line is in sight!",
            100: "You did it! You've achieved your full savings goal. What an accomplishment!",
          };

          sendSavingsMilestoneEmail(
            userDoc.email,
            userDoc.name,
            {
              milestoneName: `${milestoneNames[newMilestone]} — ${goal.name}`,
              totalSaved: `$${goal.currentAmount.toFixed(2)}`,
              goalAmount: `$${goal.targetAmount.toFixed(2)}`,
              progressPercent: newProgress,
              encouragingMessage: encouragingMessages[newMilestone],
            },
            userId
          ).catch((err) => console.error("[SavingsGoals] Milestone email failed:", err.message));
        } catch (emailErr) {
          console.error("[SavingsGoals] Email trigger error:", emailErr.message);
        }
      }
    } else {
      // Create new goal
      if (!fields.name || !fields.targetAmount) {
        return res.json({ success: false, error: "Name and targetAmount are required" }, { status: 400 });
      }
      goal = await SavingsGoal.create({ user: userId, ...fields });
    }

    return res.json({
      success: true,
      message: goalId ? "Savings goal updated" : "Savings goal created",
      goal: {
        ...goal.toJSON(),
        progressPercent: goal.targetAmount > 0
          ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
          : 0,
      },
    }, { status: goalId ? 200 : 201 });
  } catch (err) {
    console.error("[SavingsGoals] POST error:", err.message);
    return res.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/savings-goals?user=<userId>&goal=<goalId>
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");
    const goalId = searchParams.get("goal");

    if (!userId || !goalId) {
      return res.json({ success: false, error: "User ID and Goal ID are required" }, { status: 400 });
    }

    await connectToDB();
    await SavingsGoal.findOneAndDelete({ _id: goalId, user: userId });

    return res.json({ success: true, message: "Savings goal deleted" });
  } catch (err) {
    console.error("[SavingsGoals] DELETE error:", err.message);
    return res.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
