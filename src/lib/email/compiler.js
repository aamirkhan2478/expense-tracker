const fs = require("fs");
const path = require("path");
const config = require("./config");

// Only import mjml when needed (development fallback)
let mjml2html = null;

// In-memory cache for compiled/interpolated templates
const templateCache = new Map();

function getMjml2html() {
  if (!mjml2html) {
    mjml2html = require("mjml");
  }
  return mjml2html;
}

/**
 * Load pre-compiled HTML template or compile MJML at runtime.
 * @param {string} templateName - e.g. 'welcome', 'verify-email'
 * @param {string} mjmlTemplate - fallback MJML string
 * @returns {Promise<string>} HTML string
 */
async function loadOrCompile(templateName, mjmlTemplate) {
  const compiledPath = path.join(
    __dirname,
    "compiled",
    `${templateName}.html`
  );

  if (fs.existsSync(compiledPath)) {
    return fs.readFileSync(compiledPath, "utf-8");
  }

  // Fallback: compile at runtime (development)
  const result = await getMjml2html()(mjmlTemplate, {
    minify: config.mjml.minify,
    validationLevel: config.mjml.validationLevel,
  });

  if (result.errors && result.errors.length > 0) {
    console.warn(`[EmailCompiler] MJML warnings for ${templateName}:`, result.errors);
  }

  return result.html;
}

/**
 * Replace template variables like {{name}} with actual values.
 * @param {string} html
 * @param {Object} variables
 * @returns {string}
 */
function interpolate(html, variables) {
  let result = html;
  for (const [key, value] of Object.entries(variables)) {
    // Escape HTML to prevent XSS in emails
    const safeValue = String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, safeValue);
  }
  return result;
}

/**
 * Build a complete email from a template + variables.
 * @param {string} templateName
 * @param {string} mjmlTemplate
 * @param {Object} variables
 * @returns {Promise<{html: string, subject: string, previewText: string}>}
 */
async function buildEmail(templateName, mjmlTemplate, variables) {
  const cacheKey = `${templateName}_${JSON.stringify(variables)}`;

  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey);
  }

  const htmlBase = await loadOrCompile(templateName, mjmlTemplate);
  const html = interpolate(htmlBase, variables);
  const subject = variables.subject || "SpendWise Notification";
  const previewText = variables.previewText || subject;

  const output = { html, subject, previewText };
  templateCache.set(cacheKey, output);
  return output;
}

module.exports = { loadOrCompile, interpolate, buildEmail };
