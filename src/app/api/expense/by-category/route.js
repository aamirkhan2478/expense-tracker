import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Expense from "@/models/expense";
import Category from "@/models/category";
import User from "@/models/user";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user");

  if (!userId) {
    return res.json(
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();

    const userExist = await User.findById(userId);
    if (!userExist) {
      return res.json(
        { success: false, error: "User not found" },
        { status: 400 }
      );
    }

    // Default to current month if no dates provided
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let startDate, endDate;
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
      endDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59));
    }

    // Aggregate expenses by category
    const aggregation = await Expense.aggregate([
      {
        $match: {
          user: userExist._id,
          expenseDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    // Get category details
    const categoryIds = aggregation.map((a) => a._id);
    const categories = await Category.find({
      _id: { $in: categoryIds },
    }).select("name icon");

    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat._id.toString()] = cat;
    });

    // Calculate total for percentages
    const grandTotal = aggregation.reduce((sum, item) => sum + item.totalAmount, 0);

    const result = aggregation.map((item) => {
      const cat = categoryMap[item._id.toString()];
      return {
        categoryId: item._id.toString(),
        name: cat?.name || "Uncategorized",
        icon: cat?.icon || "",
        amount: item.totalAmount,
        count: item.count,
        percentage: grandTotal > 0 ? Math.round((item.totalAmount / grandTotal) * 100) : 0,
      };
    });

    return res.json({
      success: true,
      data: result,
      totalAmount: grandTotal,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
  } catch (err) {
    console.log(err.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
