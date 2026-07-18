const { baseLayout } = require("./partials/layout");

const recurringBatchSummary = baseLayout(`
  <!-- Hero Banner -->
  <mj-section background-color="#F0FDF4" padding="32px 24px">
    <mj-column>
      <mj-text align="center" font-size="40px" padding-bottom="8px">🔄</mj-text>
      <mj-text
        align="center"
        font-size="22px"
        font-weight="700"
        color="#15803D"
        padding-bottom="8px"
      >
        Recurring Transactions Processed
      </mj-text>
      <mj-text align="center" font-size="14px" color="#166534">
        Hi {{name}}, your scheduled transactions have been processed on {{processingDate}}.
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Stats Row -->
  <mj-section background-color="#ffffff" padding="24px 24px 0">
    <mj-column background-color="#F9FAFB" border-radius="12px" padding="16px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#6B7280" padding-bottom="4px">
        PROCESSED
      </mj-text>
      <mj-text align="center" font-size="32px" font-weight="700" color="#111827">
        {{totalProcessed}}
      </mj-text>
    </mj-column>
    <mj-column background-color="#ECFDF5" border-radius="12px" padding="16px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#059669" padding-bottom="4px">
        SUCCESSFUL
      </mj-text>
      <mj-text align="center" font-size="32px" font-weight="700" color="#047857">
        {{totalSuccess}}
      </mj-text>
    </mj-column>
    <mj-column background-color="#FEF2F2" border-radius="12px" padding="16px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#DC2626" padding-bottom="4px">
        FAILED
      </mj-text>
      <mj-text align="center" font-size="32px" font-weight="700" color="#991B1B">
        {{totalFailed}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Total Amount -->
  <mj-section background-color="#ffffff" padding="12px 24px 24px">
    <mj-column background-color="#EFF6FF" border-radius="12px" padding="20px">
      <mj-text align="center" font-size="13px" font-weight="600" color="#2563EB" padding-bottom="4px">
        TOTAL RECURRING AMOUNT
      </mj-text>
      <mj-text align="center" font-size="32px" font-weight="700" color="#1D4ED8">
        {{totalAmount}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Transaction List -->
  <mj-section background-color="#F9FAFB" padding="24px">
    <mj-column>
      <mj-text font-size="16px" font-weight="700" color="#111827" padding-bottom="16px">
        Transaction Details
      </mj-text>
      <mj-text color="#374151">
        {{transactionsList}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- CTA -->
  <mj-section background-color="#ffffff" padding="24px">
    <mj-column>
      <mj-button href="{{reviewUrl}}">
        Review Transactions
      </mj-button>
    </mj-column>
  </mj-section>
`, { subject: "Recurring Transactions Processed — {{processingDate}}" });

module.exports = recurringBatchSummary;
