const { baseLayout } = require("./partials/layout");

const failedLogin = baseLayout(`
  <mj-section>
    <mj-column>
      <mj-text font-size="28px" font-weight="700" color="#DC2626" padding-bottom="16px">
        Failed Login Attempt
      </mj-text>
      <mj-text>
        Hi {{name}},
      </mj-text>
      <mj-text padding-top="8px">
        We detected a failed login attempt on your SpendWise account. If this was you, you can safely ignore this email.
      </mj-text>
    </mj-column>
  </mj-section>
  <mj-section background-color="#FEF2F2" border-radius="12px" padding="16px">
    <mj-column>
      <mj-text font-size="14px" color="#7F1D1D" padding-bottom="8px">
        <strong>Time:</strong> {{timestamp}}
      </mj-text>
      <mj-text font-size="14px" color="#7F1D1D" padding-bottom="8px">
        <strong>IP Address:</strong> {{ipAddress}}
      </mj-text>
      <mj-text font-size="14px" color="#7F1D1D">
        <strong>Device:</strong> {{userAgent}}
      </mj-text>
    </mj-column>
  </mj-section>
  <mj-section>
    <mj-column>
      <mj-text padding-top="16px">
        If you didn't attempt to log in, we recommend changing your password immediately to secure your account.
      </mj-text>
      <mj-button href="{{resetUrl}}" padding-top="24px">
        Change Password
      </mj-button>
      <mj-text css-class="muted" padding-top="24px">
        If you need help, contact our support team at any time.
      </mj-text>
    </mj-column>
  </mj-section>
`, { subject: "Security Alert: Failed Login Attempt" });

module.exports = failedLogin;
