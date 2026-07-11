const nodemailer = require("nodemailer");
const config = require("./config");

let transporter = null;

/**
 * Get or create the nodemailer transporter.
 * Uses SMTP if configured, otherwise logs to console in development.
 */
function getTransporter() {
  if (transporter) return transporter;

  // If Resend API key is provided, use Resend's SMTP endpoint
  if (config.resendApiKey) {
    transporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: config.resendApiKey,
      },
    });
    return transporter;
  }

  // If SMTP credentials are provided, use them
  if (config.smtp.host && config.smtp.auth.user) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.auth,
    });
    return transporter;
  }

  // Development fallback: log emails to console
  console.warn("[Email] No SMTP or Resend config found. Using console fallback.");
  transporter = {
    sendMail: async (options) => {
      console.log("\n========== EMAIL (Console Fallback) ==========");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("From:", options.from);
      console.log("Text:", options.text?.substring(0, 200));
      console.log("===============================================\n");
      return { messageId: `console-${Date.now()}` };
    },
  };
  return transporter;
}

/**
 * Send an email.
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text]
 * @param {string} [options.from]
 * @param {string} [options.replyTo]
 * @returns {Promise<{messageId: string}>}
 */
async function send(options) {
  const transport = getTransporter();
  const from = options.from || `"${config.fromName}" <${config.fromEmail}>`;

  const result = await transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo || config.supportEmail,
  });

  return { messageId: result.messageId };
}

module.exports = { send, getTransporter };
