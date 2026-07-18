const { baseLayout } = require("./partials/layout");

const largeExpenseAlert = baseLayout(`
  <!-- Hero Alert Banner -->
  <mj-section background-color="#FEF2F2" padding="32px 24px">
    <mj-column>
      <mj-text align="center" font-size="40px" padding-bottom="8px">💸</mj-text>
      <mj-text
        align="center"
        font-size="22px"
        font-weight="700"
        color="#991B1B"
        padding-bottom="8px"
      >
        Large Expense Detected
      </mj-text>
      <mj-text align="center" font-size="14px" color="#B91C1C">
        A significant transaction has been recorded on your account, {{name}}.
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Expense Amount Highlight -->
  <mj-section background-color="#ffffff" padding="24px">
    <mj-column>
      <mj-text align="center" font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        EXPENSE AMOUNT
      </mj-text>
      <mj-text
        align="center"
        font-size="40px"
        font-weight="700"
        color="#DC2626"
        padding-bottom="24px"
      >
        {{amount}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Expense Details Card -->
  <mj-section background-color="#F9FAFB" padding="20px 24px">
    <mj-column>
      <mj-text font-size="16px" font-weight="700" color="#111827" padding-bottom="16px">
        Transaction Details
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        CATEGORY
      </mj-text>
      <mj-text font-size="15px" color="#111827" padding-bottom="16px">
        {{category}}
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        MERCHANT / DESCRIPTION
      </mj-text>
      <mj-text font-size="15px" color="#111827" padding-bottom="16px">
        {{merchant}}
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        PAYMENT METHOD
      </mj-text>
      <mj-text font-size="15px" color="#111827" padding-bottom="16px">
        {{paymentMethod}}
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        DATE
      </mj-text>
      <mj-text font-size="15px" color="#111827">
        {{date}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Budget Impact -->
  <mj-section background-color="#FEF3C7" padding="20px 24px">
    <mj-column>
      <mj-text align="center" font-size="14px" font-weight="700" color="#92400E" padding-bottom="8px">
        📊 Budget Impact
      </mj-text>
      <mj-text align="center" font-size="14px" color="#78350F">
        {{budgetImpact}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- CTA Buttons -->
  <mj-section background-color="#ffffff" padding="24px">
    <mj-column>
      <mj-button href="{{expenseUrl}}" padding-bottom="12px">
        View Expense
      </mj-button>
      <mj-button href="{{budgetUrl}}" background-color="#F59E0B" color="#ffffff">
        Review Budget
      </mj-button>
      <mj-text align="center" font-size="12px" color="#9CA3AF" padding-top="16px">
        You are receiving this because large expense alerts are enabled for your account.
      </mj-text>
    </mj-column>
  </mj-section>
`, { subject: "Large Expense Alert: {{amount}} Recorded" });

module.exports = largeExpenseAlert;
