import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import Income from "@/models/income";
import { requireUser } from "@/lib/auth-middleware";
import { incomeCreateSchema } from "@/lib/validation/transactions";
import { toObjectId } from "@/utils/mongo";

export async function POST(req) {
  try {
    await connectToDB();

    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    const userId = auth.user.id;

    const body = await req.json();
    // The owning user is derived from the token — drop any client-supplied "user".
    const { user: _clientUser, ...payload } = body;

    const { error, value } = incomeCreateSchema.validate(payload, { abortEarly: false });
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

    const { companyName, title, amount, incomeDate, isRecurring, recurringFrequency } = value;

    const income = new Income({
      companyName,
      title,
      amount,
      incomeDate,
      user: userId,
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? recurringFrequency : null,
      lastProcessedAt: isRecurring ? incomeDate : null,
    });
    await income.save();
    return res.json({ success: true, msg: "Income created" }, { status: 201 });
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const incomePage = searchParams.get("page");
  const incomeLimit = searchParams.get("limit");
  const incomeDate = searchParams.get("incomeDate");
  const isRecurring = searchParams.get("isRecurring") || "";

  const page = Number(incomePage) || 1;
  const limit = Number(incomeLimit) || 5;
  const startIndex = (page - 1) * limit;

  try {
    await connectToDB();

    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    const user = auth.user.id;

    let filter = {};
    if (incomeDate) {
      const startDate = new Date(incomeDate);
      const endDate = new Date(incomeDate);
      endDate.setMonth(endDate.getMonth() + 1);
      filter.incomeDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    if (isRecurring === "true" || isRecurring === "false") {
      filter.isRecurring = isRecurring === "true";
    }

    const result = await Income.find({
      user,
      ...filter,
    })
      .sort("-createdAt")
      .skip(startIndex)
      .limit(limit);

    const totalIncomes = await Income.countDocuments({
      user,
      ...filter,
    });

    const endIndex = Math.min(startIndex + limit, totalIncomes);

    const pagination = {};

    if (endIndex < totalIncomes) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      pagination.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    // Aggregate the filtered total in the database rather than loading every
    // matching document into memory. The id must be an ObjectId because
    // aggregate() does not cast a string id the way find() does.
    const [totalAgg] = await Income.aggregate([
      { $match: { user: toObjectId(user), ...filter } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);
    const totalAmount = totalAgg?.totalAmount || 0;

    return res.json(
      {
        success: true,
        data: result,
        page,
        totalIncomes,
        totalAmount,
        pagination,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error.message);
    return res.json({ error: "Server Error" }, { status: 500 });
  }
}
