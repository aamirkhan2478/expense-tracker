const { baseLayout } = require("./partials/layout");

const budgetWarning = baseLayout(`
  <mj-section>
    <mj-column>
      <mj-text font-size="28px" font-weight="700" color="#111827" padding-bottom="16px">
        Budget Alert: 80% Used
      </mj-text>
      <mj-text>
        Hi {{name}},
      </mj-text>
      <mj-text padding-top="8px">
        You've used <strong>{{percentage}}%</strong> of your <strong>{{category}}</strong> budget for {{month}}. You're getting close to your limit!
      </mj-text>
    </mj-column>
  </mj-section>
  <mj-section background-color="#FEF3C7" border-radius="12px" padding="16px">
    <mj-column>
      <mj-text align="center" font-size="20px" font-weight="700" color="#92400E">
        {{spent}} / {{budget}}
      </mj-text>
      <mj-text align="center" css-class="muted" padding-top="4px">
        Spent so far this month
      </mj-text>
    </mj-column>
  </mj-section>
  <mj-section>
    <mj-column>
      <mj-text padding-top="16px">
        Consider reviewing your spending in this category to stay within budget.
      </mj-text>
      <mj-button href="{{expensesUrl}}" padding-top="24px">
        View Expenses
      </mj-button>
    </mj-column>
  </mj-section>
`, { subject: "Budget Warning: {{category}} at {{percentage}}%" });

module.exports = budgetWarning;
