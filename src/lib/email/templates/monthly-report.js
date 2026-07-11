const { baseLayout } = require("./partials/layout");

const monthlyReport = baseLayout(`
  <mj-section>
    <mj-column>
      <mj-text font-size="28px" font-weight="700" color="#111827" padding-bottom="16px">
        Your Monthly Financial Report
      </mj-text>
      <mj-text>
        Hi {{name}},
      </mj-text>
      <mj-text padding-top="8px">
        Here's a summary of your finances for <strong>{{month}}</strong>.
      </mj-text>
    </mj-column>
  </mj-section>
  <mj-section background-color="#ECFDF5" border-radius="12px" padding="16px">
    <mj-column>
      <mj-text align="center" font-size="14px" color="#059669" font-weight="600">Total Income</mj-text>
      <mj-text align="center" font-size="24px" font-weight="700" color="#047857" padding-top="4px">{{totalIncome}}</mj-text>
    </mj-column>
  </mj-section>
  <mj-section background-color="#FEF2F2" border-radius="12px" padding="16px">
    <mj-column>
      <mj-text align="center" font-size="14px" color="#DC2626" font-weight="600">Total Expenses</mj-text>
      <mj-text align="center" font-size="24px" font-weight="700" color="#B91C1C" padding-top="4px">{{totalExpense}}</mj-text>
    </mj-column>
  </mj-section>
  <mj-section background-color="#EFF6FF" border-radius="12px" padding="16px">
    <mj-column>
      <mj-text align="center" font-size="14px" color="#2563EB" font-weight="600">Net Savings</mj-text>
      <mj-text align="center" font-size="24px" font-weight="700" color="#1D4ED8" padding-top="4px">{{netSavings}}</mj-text>
    </mj-column>
  </mj-section>
  <mj-section>
    <mj-column>
      <mj-text padding-top="24px" font-weight="600">
        Top Expense Categories
      </mj-text>
      <mj-text padding-top="8px">
        {{topCategories}}
      </mj-text>
      <mj-button href="{{reportsUrl}}" padding-top="32px">
        View Full Report
      </mj-button>
    </mj-column>
  </mj-section>
`, { subject: "Your {{month}} Financial Report" });

module.exports = monthlyReport;
