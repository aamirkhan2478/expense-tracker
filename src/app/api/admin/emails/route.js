import { NextResponse as res } from "next/server";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";
import {
  EmailLog,
  getEmailLogs,
  getFailedEmails,
  retryEmail,
} from "@/lib/email/tracker";
import { enqueue } from "@/lib/email/queue";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!userId) {
      return res.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();
    const user = await User.findById(userId);
    if (!user) {
      return res.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const query = { userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const logs = await getEmailLogs(query)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await EmailLog.countDocuments(query);

    return res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[AdminEmails] GET error:", error);
    return res.json(
      { success: false, message: "Failed to fetch email logs" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user");

    if (!userId) {
      return res.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();
    const user = await User.findById(userId);
    if (!user) {
      return res.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action, jobId } = body;

    if (action === "retry" && jobId) {
      const job = await retryEmail(jobId);
      if (!job) {
        return res.json(
          { success: false, message: "Email not found or not failed" },
          { status: 404 }
        );
      }

      const newJobId = await enqueue({
        to: job.to,
        subject: job.subject,
        html: job.html,
        type: job.type,
        userId: job.userId,
      });

      return res.json({
        success: true,
        message: "Email queued for retry",
        jobId: newJobId,
      });
    }

    if (action === "retry-all-failed") {
      const failed = await getFailedEmails();
      const retried = [];

      for (const email of failed) {
        const job = await retryEmail(email.jobId);
        if (job) {
          const newJobId = await enqueue({
            to: job.to,
            subject: job.subject,
            html: job.html,
            type: job.type,
            userId: job.userId,
          });
          retried.push(newJobId);
        }
      }

      return res.json({
        success: true,
        message: `Retried ${retried.length} failed emails`,
        retried,
      });
    }

    return res.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[AdminEmails] POST error:", error);
    return res.json(
      { success: false, message: "Failed to process action" },
      { status: 500 }
    );
  }
}
