const { baseLayout } = require("./partials/layout");

const welcome = baseLayout(`
  <mj-section>
    <mj-column>
      <mj-text font-size="28px" font-weight="700" color="#111827" padding-bottom="16px">
        Welcome to SpendWise, {{name}}!
      </mj-text>
      <mj-text>
        We're thrilled to have you on board. SpendWise helps you track expenses, manage budgets, and gain insights into your financial habits — all in one beautiful place.
      </mj-text>
      <mj-text padding-top="16px">
        Here's what you can do next:
      </mj-text>
      <mj-text padding-top="8px">
        <ul style="margin: 0; padding-left: 20px;">
          <li>Set up your first budget category</li>
          <li>Add your income sources</li>
          <li>Track your daily expenses</li>
          <li>View beautiful reports and analytics</li>
        </ul>
      </mj-text>
      <mj-button href="{{dashboardUrl}}" padding-top="32px">
        Go to Dashboard
      </mj-button>
      <mj-text css-class="muted" padding-top="24px">
        If you didn't create this account, please ignore this email or contact our support team.
      </mj-text>
    </mj-column>
  </mj-section>
`, { subject: "Welcome to SpendWise" });

module.exports = welcome;
