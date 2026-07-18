const { baseLayout } = require("./partials/layout");

const bulkImportSummary = baseLayout(`
  <!-- Hero Banner -->
  <mj-section background-color="#F0FDF4" padding="32px 24px">
    <mj-column>
      <mj-text align="center" font-size="40px" padding-bottom="8px">📥</mj-text>
      <mj-text
        align="center"
        font-size="22px"
        font-weight="700"
        color="#15803D"
        padding-bottom="8px"
      >
        Bulk Import Completed
      </mj-text>
      <mj-text align="center" font-size="14px" color="#166534">
        Hi {{name}}, your data import has finished processing.
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Stats Grid -->
  <mj-section background-color="#ffffff" padding="24px 24px 0">
    <mj-column background-color="#F9FAFB" border-radius="12px" padding="16px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#6B7280" padding-bottom="4px">
        TOTAL ROWS
      </mj-text>
      <mj-text align="center" font-size="28px" font-weight="700" color="#111827">
        {{totalProcessed}}
      </mj-text>
    </mj-column>
    <mj-column background-color="#ECFDF5" border-radius="12px" padding="16px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#059669" padding-bottom="4px">
        IMPORTED
      </mj-text>
      <mj-text align="center" font-size="28px" font-weight="700" color="#047857">
        {{successCount}}
      </mj-text>
    </mj-column>
  </mj-section>

  <mj-section background-color="#ffffff" padding="12px 24px 24px">
    <mj-column background-color="#FEF2F2" border-radius="12px" padding="16px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#DC2626" padding-bottom="4px">
        FAILED
      </mj-text>
      <mj-text align="center" font-size="28px" font-weight="700" color="#991B1B">
        {{failedCount}}
      </mj-text>
    </mj-column>
    <mj-column background-color="#FEF3C7" border-radius="12px" padding="16px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#D97706" padding-bottom="4px">
        DUPLICATES SKIPPED
      </mj-text>
      <mj-text align="center" font-size="28px" font-weight="700" color="#92400E">
        {{duplicateCount}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Processing Time -->
  <mj-section background-color="#EFF6FF" padding="16px 24px">
    <mj-column>
      <mj-text align="center" font-size="13px" font-weight="600" color="#1E40AF">
        ⏱️ Processing time: {{processingTime}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Error Summary (shown only if failures exist) -->
  <mj-section background-color="#F9FAFB" padding="24px">
    <mj-column>
      <mj-text font-size="16px" font-weight="700" color="#111827" padding-bottom="16px">
        Import Summary
      </mj-text>
      <mj-text color="#374151">
        {{errorSummary}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- CTA Buttons -->
  <mj-section background-color="#ffffff" padding="24px">
    <mj-column>
      <mj-button href="{{viewTransactionsUrl}}" padding-bottom="12px">
        View Imported Transactions
      </mj-button>
      <mj-button href="{{downloadReportUrl}}" background-color="#6B7280" color="#ffffff">
        Download Import Report
      </mj-button>
    </mj-column>
  </mj-section>
`, { subject: "Import Complete: {{successCount}} of {{totalProcessed}} Transactions Imported" });

module.exports = bulkImportSummary;
