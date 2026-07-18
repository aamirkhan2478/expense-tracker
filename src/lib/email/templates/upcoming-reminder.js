const { baseLayout } = require("./partials/layout");

const upcomingReminder = baseLayout(`
  <!-- Hero Banner -->
  <mj-section background-color="#EFF6FF" padding="32px 24px">
    <mj-column>
      <mj-text align="center" font-size="40px" padding-bottom="8px">📅</mj-text>
      <mj-text
        align="center"
        font-size="22px"
        font-weight="700"
        color="#1E40AF"
        padding-bottom="8px"
      >
        Upcoming Recurring Payment
      </mj-text>
      <mj-text align="center" font-size="14px" color="#3B82F6">
        Hi {{name}}, your scheduled payment is coming up soon.
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Payment Amount Highlight -->
  <mj-section background-color="#ffffff" padding="24px 24px 8px">
    <mj-column>
      <mj-text align="center" font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        SCHEDULED AMOUNT
      </mj-text>
      <mj-text
        align="center"
        font-size="40px"
        font-weight="700"
        color="#1D4ED8"
        padding-bottom="8px"
      >
        {{amount}}
      </mj-text>
      <mj-text align="center" font-size="14px" color="#6B7280">
        {{transactionName}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Due Date Banner -->
  <mj-section background-color="#DBEAFE" padding="16px 24px">
    <mj-column>
      <mj-text align="center" font-size="14px" font-weight="700" color="#1E40AF">
        Due: {{dueDate}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Transaction Details -->
  <mj-section background-color="#F9FAFB" padding="20px 24px">
    <mj-column>
      <mj-text font-size="16px" font-weight="700" color="#111827" padding-bottom="16px">
        Payment Details
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        CATEGORY
      </mj-text>
      <mj-text font-size="15px" color="#111827" padding-bottom="16px">
        {{category}}
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        FREQUENCY
      </mj-text>
      <mj-text font-size="15px" color="#111827" padding-bottom="16px">
        {{frequency}}
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        NEXT PAYMENT DATE
      </mj-text>
      <mj-text font-size="15px" color="#111827">
        {{nextPaymentDate}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- CTA Buttons -->
  <mj-section background-color="#ffffff" padding="24px">
    <mj-column>
      <mj-button href="{{recurringUrl}}" padding-bottom="12px">
        View Recurring Payments
      </mj-button>
      <mj-button href="{{settingsUrl}}" background-color="#6B7280" color="#ffffff">
        Edit Reminder Settings
      </mj-button>
    </mj-column>
  </mj-section>
`, { subject: "Reminder: {{transactionName}} is due on {{dueDate}}" });

module.exports = upcomingReminder;
