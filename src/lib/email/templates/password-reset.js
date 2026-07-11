const { baseLayout } = require("./partials/layout");

const passwordReset = baseLayout(`
  <mj-section>
    <mj-column>
      <mj-text font-size="28px" font-weight="700" color="#111827" padding-bottom="16px">
        Reset Your Password
      </mj-text>
      <mj-text>
        Hi {{name}},
      </mj-text>
      <mj-text padding-top="8px">
        We received a request to reset your SpendWise password. Click the button below to set a new password. This link will expire in {{expiresIn}}.
      </mj-text>
      <mj-button href="{{resetUrl}}" padding-top="32px">
        Reset Password
      </mj-button>
      <mj-text css-class="muted" padding-top="24px">
        If the button doesn't work, copy and paste this link into your browser:
      </mj-text>
      <mj-text css-class="muted" font-size="12px">
        {{resetUrl}}
      </mj-text>
      <mj-text css-class="muted" padding-top="16px">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </mj-text>
    </mj-column>
  </mj-section>
`, { subject: "Reset your SpendWise password" });

module.exports = passwordReset;
