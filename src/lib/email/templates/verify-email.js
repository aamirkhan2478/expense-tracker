const { baseLayout } = require("./partials/layout");

const verifyEmail = baseLayout(`
  <mj-section>
    <mj-column>
      <mj-text font-size="28px" font-weight="700" color="#111827" padding-bottom="16px">
        Verify Your Email Address
      </mj-text>
      <mj-text>
        Hi {{name}},
      </mj-text>
      <mj-text padding-top="8px">
        Thanks for signing up for SpendWise! Please verify your email address by clicking the button below. This link will expire in {{expiresIn}}.
      </mj-text>
      <mj-button href="{{verificationUrl}}" padding-top="32px">
        Verify Email Address
      </mj-button>
      <mj-text css-class="muted" padding-top="24px">
        If the button doesn't work, copy and paste this link into your browser:
      </mj-text>
      <mj-text css-class="muted" font-size="12px">
        {{verificationUrl}}
      </mj-text>
      <mj-text css-class="muted" padding-top="16px">
        If you didn't create an account, you can safely ignore this email.
      </mj-text>
    </mj-column>
  </mj-section>
`, { subject: "Verify your SpendWise account" });

module.exports = verifyEmail;
