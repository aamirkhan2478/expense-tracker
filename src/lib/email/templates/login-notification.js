const { baseLayout } = require("./partials/layout");

const loginNotification = baseLayout(`
  <!-- Security Badge Banner -->
  <mj-section background-color="#0F172A" padding="32px 24px">
    <mj-column>
      <mj-text align="center" font-size="40px" padding-bottom="8px">🔐</mj-text>
      <mj-text
        align="center"
        font-size="22px"
        font-weight="700"
        color="#F1F5F9"
        padding-bottom="8px"
      >
        New Login Detected
      </mj-text>
      <mj-text align="center" font-size="14px" color="#94A3B8">
        Hi {{name}}, we noticed a new sign-in to your account
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Login Details Card -->
  <mj-section background-color="#ffffff" padding="24px">
    <mj-column>
      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        DATE &amp; TIME
      </mj-text>
      <mj-text font-size="16px" font-weight="600" color="#111827" padding-bottom="16px">
        {{timestamp}}
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        DEVICE
      </mj-text>
      <mj-text font-size="16px" font-weight="600" color="#111827" padding-bottom="16px">
        {{device}}
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        BROWSER
      </mj-text>
      <mj-text font-size="16px" font-weight="600" color="#111827" padding-bottom="16px">
        {{browser}}
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        OPERATING SYSTEM
      </mj-text>
      <mj-text font-size="16px" font-weight="600" color="#111827" padding-bottom="16px">
        {{os}}
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        APPROXIMATE LOCATION
      </mj-text>
      <mj-text font-size="16px" font-weight="600" color="#111827" padding-bottom="4px">
        {{location}}
      </mj-text>
      <mj-text font-size="12px" color="#9CA3AF" padding-bottom="16px">
        Location data is approximate and may not be exact.
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        IP ADDRESS
      </mj-text>
      <mj-text font-size="16px" font-weight="600" color="#111827" padding-bottom="16px">
        {{ipAddress}}
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        LOGIN METHOD
      </mj-text>
      <mj-text font-size="16px" font-weight="600" color="#111827">
        {{loginMethod}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Was This You? Section -->
  <mj-section background-color="#FEF3C7" padding="20px 24px">
    <mj-column>
      <mj-text align="center" font-size="18px" font-weight="700" color="#92400E" padding-bottom="8px">
        🤔 Was this you?
      </mj-text>
      <mj-text align="center" font-size="14px" color="#78350F">
        If you recognize this login, no action is needed. If you did not log in, secure your account immediately.
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- CTA Buttons -->
  <mj-section background-color="#ffffff" padding="24px">
    <mj-column>
      <mj-button href="{{activityUrl}}" padding-bottom="12px" background-color="#14B8A6">
        View Account Activity
      </mj-button>
      <mj-button href="{{secureAccountUrl}}" background-color="#DC2626">
        Secure My Account
      </mj-button>
      <mj-text align="center" font-size="12px" color="#9CA3AF" padding-top="16px">
        If you need help, contact us at support.
      </mj-text>
    </mj-column>
  </mj-section>
`, { subject: "Security Alert: New Login Detected" });

module.exports = loginNotification;
