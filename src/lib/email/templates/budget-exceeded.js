const { baseLayout } = require("./partials/layout");

const budgetExceeded = baseLayout(`
  <mj-section>
    <mj-column>
      <mj-text font-size="28px" font-weight="700" color="#DC2626" padding-bottom="16px">
        Budget Exceeded
      </mj-text>
      <mj-text>
        Hi {{name}},
      </mj-text>
      <mj-text padding-top="8px">
        You've exceeded your <strong>{{category}}</strong> budget for {{month}}. Here's a quick summary:
      </mj-text>
    </mj-column>
  </mj-section>
  <mj-section background-color="#FEE2E2" border-radius="12px" padding="16px">
    <mj-column>
      <mj-text align="center" font-size="20px" font-weight="700" color="#991B1B">
        {{spent}} / {{budget}}
      </mj-text>
      <mj-text align="center" css-class="muted" padding-top="4px">
        Over by {{overAmount}}
      </mj-text>
    </mj-column>
  </mj-section>
  <mj-section>
    <mj-column>
      <mj-text padding-top="16px">
        You may want to adjust your budget or review recent expenses in this category.
      </mj-text>
      <mj-button href="{{expensesUrl}}" padding-top="24px">
        Review Expenses
      </mj-button>
    </mj-column>
  </mj-section>
`, { subject: "Budget Exceeded: {{category}}" });

module.exports = budgetExceeded;
