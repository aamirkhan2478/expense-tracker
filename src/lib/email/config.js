// Email configuration loaded from environment variables
const config = {
  // Sender info
  fromName: process.env.EMAIL_FROM_NAME || "SpendWise",
  fromEmail: process.env.EMAIL_FROM_EMAIL || "noreply@spendwise.app",
  supportEmail: process.env.EMAIL_SUPPORT_EMAIL || "aamir.khan2478@gmail.com",
  frontendUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // SMTP / Transport
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  },

  // Resend API key (alternative to SMTP)
  resendApiKey: process.env.RESEND_API_KEY || "",

  // Queue settings
  queue: {
    maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES || "3"),
    retryDelayMs: parseInt(process.env.EMAIL_RETRY_DELAY_MS || "5000"),
    concurrency: parseInt(process.env.EMAIL_CONCURRENCY || "5"),
  },

  // MJML compiler
  mjml: {
    minify: process.env.NODE_ENV === "production",
    validationLevel: "soft",
  },
};

module.exports = config;
