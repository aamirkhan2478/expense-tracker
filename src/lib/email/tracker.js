const { Schema, model, models } = require("mongoose");

/**
 * Email logs contain the recipient address, the rendered HTML body, and delivery
 * metadata. That is personal data, so it is not kept indefinitely: a TTL index
 * removes each log once it ages out.
 *
 * The rendered HTML is retained for the same window because retryEmail() needs it
 * to re-send a failed message; failed mail is retried within hours or days, well
 * inside this window.
 */
const RETENTION_DAYS = (() => {
  const parsed = parseInt(process.env.EMAIL_LOG_RETENTION_DAYS || "90", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 90;
})();

const EmailLogSchema = new Schema(
  {
    jobId: { type: String, required: true, index: true },
    to: { type: String, required: true },
    subject: { type: String, required: true },
    type: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["queued", "sent", "failed", "bounced"],
      default: "queued",
    },
    messageId: { type: String, default: null },
    errorMessage: { type: String, default: null },
    html: { type: String },
    sentAt: { type: Date },
    failedAt: { type: Date },
  },
  { timestamps: true }
);

// Admin log browsing filters by user and orders by recency.
EmailLogSchema.index({ userId: 1, createdAt: -1 });

// Mongo expires each document this many seconds after its createdAt.
EmailLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 });

const EmailLog = models.EmailLog || model("EmailLog", EmailLogSchema);

async function trackEmail(data) {
  try {
    await EmailLog.create(data);
  } catch (err) {
    console.error("[EmailTracker] Failed to log email:", err.message);
  }
}

async function markSent(jobId, messageId) {
  try {
    await EmailLog.findOneAndUpdate(
      { jobId },
      { status: "sent", messageId, sentAt: new Date() }
    );
  } catch (err) {
    console.error("[EmailTracker] Failed to mark sent:", err.message);
  }
}

async function markFailed(jobId, errorMessage) {
  try {
    await EmailLog.findOneAndUpdate(
      { jobId },
      { status: "failed", errorMessage, failedAt: new Date() }
    );
  } catch (err) {
    console.error("[EmailTracker] Failed to mark failed:", err.message);
  }
}

function getEmailLogs(query = {}) {
  return EmailLog.find(query).sort("-createdAt");
}

async function getFailedEmails() {
  return EmailLog.find({ status: "failed" }).sort("-createdAt").lean();
}

async function retryEmail(jobId) {
  const log = await EmailLog.findOne({ jobId });
  if (!log || log.status !== "failed") return null;

  await EmailLog.findOneAndUpdate(
    { jobId },
    { status: "queued", errorMessage: null, failedAt: null }
  );

  return {
    to: log.to,
    subject: log.subject,
    html: log.html,
    type: log.type,
    userId: log.userId,
  };
}

module.exports = {
  EmailLog,
  trackEmail,
  markSent,
  markFailed,
  getEmailLogs,
  getFailedEmails,
  retryEmail,
};
