const { baseLayout } = require("./partials/layout");

const weeklySpendingSummary = baseLayout(`
  <!-- Hero Banner -->
  <mj-section background-color="#0F172A" padding="32px 24px">
    <mj-column>
      <mj-text align="center" font-size="40px" padding-bottom="8px">📊</mj-text>
      <mj-text
        align="center"
        font-size="22px"
        font-weight="700"
        color="#F1F5F9"
        padding-bottom="8px"
      >
        Your Weekly Financial Summary
      </mj-text>
      <mj-text align="center" font-size="14px" color="#94A3B8">
        Hi {{name}}, here's a snapshot of your finances for {{weekRange}}.
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Summary Cards Row 1: Spending & Income -->
  <mj-section background-color="#ffffff" padding="24px 24px 0">
    <mj-column background-color="#FEF2F2" border-radius="16px" padding="20px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#DC2626" padding-bottom="4px">
        TOTAL SPENDING
      </mj-text>
      <mj-text align="center" font-size="28px" font-weight="700" color="#991B1B">
        {{totalSpending}}
      </mj-text>
    </mj-column>
    <mj-column background-color="#ECFDF5" border-radius="16px" padding="20px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#059669" padding-bottom="4px">
        TOTAL INCOME
      </mj-text>
      <mj-text align="center" font-size="28px" font-weight="700" color="#047857">
        {{totalIncome}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Summary Cards Row 2: Savings & Budget -->
  <mj-section background-color="#ffffff" padding="12px 24px 24px">
    <mj-column background-color="#EFF6FF" border-radius="16px" padding="20px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#2563EB" padding-bottom="4px">
        NET SAVINGS
      </mj-text>
      <mj-text align="center" font-size="28px" font-weight="700" color="#1D4ED8">
        {{netSavings}}
      </mj-text>
    </mj-column>
    <mj-column background-color="#FEF3C7" border-radius="16px" padding="20px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#D97706" padding-bottom="4px">
        BUDGET USED
      </mj-text>
      <mj-text align="center" font-size="28px" font-weight="700" color="#92400E">
        {{budgetUsage}}%
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Top Spending Categories -->
  <mj-section background-color="#F9FAFB" padding="24px">
    <mj-column>
      <mj-text font-size="16px" font-weight="700" color="#111827" padding-bottom="4px">
        🏆 Top Spending Categories
      </mj-text>
      <mj-text font-size="13px" color="#6B7280" padding-bottom="16px">
        Where your money went this week
      </mj-text>
      <mj-text color="#374151">
        {{topCategories}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Largest Expense & Comparison -->
  <mj-section background-color="#ffffff" padding="24px">
    <mj-column>
      <mj-text font-size="16px" font-weight="700" color="#111827" padding-bottom="16px">
        📌 Highlights
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        LARGEST EXPENSE THIS WEEK
      </mj-text>
      <mj-text font-size="15px" color="#111827" padding-bottom="20px">
        {{largestExpense}}
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        COMPARED TO LAST WEEK
      </mj-text>
      <mj-text font-size="15px" color="#111827" padding-bottom="20px">
        {{weeklyComparison}}
      </mj-text>

      <mj-text font-size="13px" font-weight="600" color="#6B7280" padding-bottom="4px">
        SPENDING TREND
      </mj-text>
      <mj-text font-size="15px" color="#111827">
        {{spendingTrend}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Financial Insight -->
  <mj-section background-color="#F0FDF4" padding="20px 24px">
    <mj-column>
      <mj-text align="center" font-size="14px" font-weight="700" color="#15803D" padding-bottom="8px">
        💡 This Week's Insight
      </mj-text>
      <mj-text align="center" font-size="14px" color="#166534">
        {{financialInsight}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- CTA -->
  <mj-section background-color="#ffffff" padding="24px">
    <mj-column>
      <mj-button href="{{reportUrl}}">
        View Full Report
      </mj-button>
    </mj-column>
  </mj-section>
`, { subject: "Your Weekly Spending Summary — {{weekRange}}" });

module.exports = weeklySpendingSummary;
