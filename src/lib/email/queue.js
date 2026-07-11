const config = require("./config");
const { send } = require("./sender");
const { trackEmail, markFailed, markSent } = require("./tracker");

// Simple in-memory queue (replace with BullMQ + Redis in production)
const queue = [];
let isProcessing = false;
let processedCount = 0;

/**
 * Add an email to the queue.
 * @param {Object} job
 * @param {string} job.to
 * @param {string} job.subject
 * @param {string} job.html
 * @param {string} [job.text]
 * @param {string} [job.type] - template type for tracking
 * @param {string} [job.userId] - user ID for tracking
 * @param {number} [job.attempt=1]
 */
async function enqueue(job) {
  const jobWithMeta = {
    ...job,
    id: `email_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    attempt: job.attempt || 1,
    createdAt: new Date(),
  };

  queue.push(jobWithMeta);

  // Track in DB
  await trackEmail({
    jobId: jobWithMeta.id,
    to: job.to,
    subject: job.subject,
    type: job.type || "unknown",
    userId: job.userId || null,
    status: "queued",
    html: job.html,
  });

  // Start processing if not already running
  if (!isProcessing) {
    processQueue();
  }

  return jobWithMeta.id;
}

/**
 * Process the email queue with concurrency and retry logic.
 */
async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  const concurrency = config.queue.concurrency;
  const batch = queue.splice(0, concurrency);

  await Promise.allSettled(batch.map(processJob));

  isProcessing = false;

  // Continue processing if more jobs exist
  if (queue.length > 0) {
    setTimeout(processQueue, 100);
  }
}

/**
 * Process a single email job.
 */
async function processJob(job) {
  try {
    const result = await send({
      to: job.to,
      subject: job.subject,
      html: job.html,
      text: job.text,
    });

    await markSent(job.id, result.messageId);
    processedCount++;
  } catch (err) {
    console.error(`[EmailQueue] Failed to send email ${job.id}:`, err.message);

    if (job.attempt < config.queue.maxRetries) {
      // Retry with exponential backoff
      const delay = config.queue.retryDelayMs * Math.pow(2, job.attempt - 1);
      job.attempt++;

      setTimeout(() => {
        queue.push(job);
        if (!isProcessing) processQueue();
      }, delay);
    } else {
      await markFailed(job.id, err.message);
    }
  }
}

/**
 * Get queue stats.
 */
function getStats() {
  return {
    pending: queue.length,
    processed: processedCount,
  };
}

module.exports = { enqueue, processQueue, getStats };
