const config = require("../../config");

const baseUrl = config.frontendUrl;
const supportEmail = config.supportEmail;
const fromName = config.fromName;

/**
 * Wrap content in the branded base MJML layout.
 * Content should be a series of mj-section > mj-column blocks.
 */
function baseLayout(contentMjml, options = {}) {
  const { subject = "SpendWise" } = options;
  return `
<mjml>
  <mj-head>
    <mj-title>${subject}</mj-title>
    <mj-preview>{{previewText}}</mj-preview>
    <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
    <mj-attributes>
      <mj-all font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" />
      <mj-text font-size="16px" line-height="24px" color="#374151" />
      <mj-button background-color="#14B8A6" color="#ffffff" font-size="16px" font-weight="600" border-radius="12px" padding="16px 32px" />
      <mj-section padding="16px 24px" background-color="#ffffff" />
      <mj-column width="100%" />
    </mj-attributes>
    <mj-style>
      .brand-link { color: #14B8A6; text-decoration: none; }
      .muted { color: #6B7280; font-size: 14px; }
      .footer-link { color: #9CA3AF; text-decoration: none; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#F3F4F6">
    <!-- Header with Logo -->
    <mj-section padding="24px 0" background-color="#ffffff">
      <mj-column>
        <mj-text align="center" font-size="24px" font-weight="700" color="#14B8A6">
          ${fromName}
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Main Content -->
    ${contentMjml}

    <!-- Footer -->
    <mj-section padding="24px" background-color="#F9FAFB">
      <mj-column>
        <mj-text align="center" css-class="muted">
          Need help? Contact us at <a href="mailto:${supportEmail}" class="brand-link">${supportEmail}</a>
        </mj-text>
        <mj-text align="center" css-class="muted" padding-top="8px">
          <a href="${baseUrl}" class="footer-link">${baseUrl.replace(/^https?:\/\//, "")}</a>
        </mj-text>
        <mj-text align="center" css-class="muted" padding-top="16px" font-size="12px">
          &copy; ${new Date().getFullYear()} ${fromName}. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `.trim();
}

module.exports = { baseLayout };
