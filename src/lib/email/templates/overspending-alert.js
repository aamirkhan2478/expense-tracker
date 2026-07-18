const { baseLayout } = require("./partials/layout");

const overspendingAlert = baseLayout(`
  <!-- Hero Alert Banner -->
  <mj-section background-color="#FFF7ED" padding="32px 24px">
    <mj-column>
      <mj-text align="center" font-size="40px" padding-bottom="8px">⚠️</mj-text>
      <mj-text
        align="center"
        font-size="22px"
        font-weight="700"
        color="#C2410C"
        padding-bottom="8px"
      >
        Overspending Alert
      </mj-text>
      <mj-text align="center" font-size="14px" color="#EA580C">
        Hi {{name}}, {{alertMessage}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Spending Comparison -->
  <mj-section background-color="#ffffff" padding="24px 24px 0">
    <mj-column background-color="#FEF2F2" border-radius="16px" padding="20px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#DC2626" padding-bottom="4px">
        CURRENT SPENDING
      </mj-text>
      <mj-text align="center" font-size="28px" font-weight="700" color="#991B1B">
        {{currentSpending}}
      </mj-text>
    </mj-column>
    <mj-column background-color="#F9FAFB" border-radius="16px" padding="20px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#6B7280" padding-bottom="4px">
        AVERAGE SPENDING
      </mj-text>
      <mj-text align="center" font-size="28px" font-weight="700" color="#374151">
        {{averageSpending}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Difference Banner -->
  <mj-section background-color="#ffffff" padding="12px 24px 24px">
    <mj-column background-color="#FEF3C7" border-radius="12px" padding="16px">
      <mj-text align="center" font-size="13px" font-weight="700" color="#92400E" padding-bottom="4px">
        OVER YOUR AVERAGE BY
      </mj-text>
      <mj-text align="center" font-size="28px" font-weight="700" color="#B45309">
        {{difference}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Top Contributing Categories -->
  <mj-section background-color="#F9FAFB" padding="24px">
    <mj-column>
      <mj-text font-size="16px" font-weight="700" color="#111827" padding-bottom="4px">
        🏷️ Top Contributing Categories
      </mj-text>
      <mj-text font-size="13px" color="#6B7280" padding-bottom="16px">
        These categories are driving your higher spending
      </mj-text>
      <mj-text color="#374151">
        {{topCategories}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Suggested Actions -->
  <mj-section background-color="#ECFDF5" padding="20px 24px">
    <mj-column>
      <mj-text align="center" font-size="14px" font-weight="700" color="#15803D" padding-bottom="8px">
        💡 Suggested Actions
      </mj-text>
      <mj-text font-size="14px" color="#166534">
        {{suggestedActions}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- CTA Buttons -->
  <mj-section background-color="#ffffff" padding="24px">
    <mj-column>
      <mj-button href="{{spendingUrl}}" padding-bottom="12px">
        Review Spending
      </mj-button>
      <mj-button href="{{budgetUrl}}" background-color="#F59E0B" color="#ffffff">
        Update Budget
      </mj-button>
    </mj-column>
  </mj-section>
`, { subject: "Overspending Alert: Your Spending is Above Average" });

module.exports = overspendingAlert;
