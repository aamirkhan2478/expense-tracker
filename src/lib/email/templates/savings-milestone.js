const { baseLayout } = require("./partials/layout");

const savingsMilestone = baseLayout(`
  <!-- Hero Celebration Banner -->
  <mj-section background-color="#0F172A" padding="40px 24px">
    <mj-column>
      <mj-text align="center" font-size="56px" padding-bottom="8px">🎉</mj-text>
      <mj-text
        align="center"
        font-size="26px"
        font-weight="700"
        color="#F1F5F9"
        padding-bottom="8px"
      >
        Milestone Reached!
      </mj-text>
      <mj-text align="center" font-size="16px" color="#CBD5E1">
        Congratulations {{name}}! You've hit a major savings milestone.
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Milestone Badge -->
  <mj-section background-color="#ffffff" padding="32px 24px 16px">
    <mj-column>
      <mj-text align="center" font-size="13px" font-weight="700" color="#6B7280" padding-bottom="8px">
        🏅 MILESTONE ACHIEVED
      </mj-text>
      <mj-text
        align="center"
        font-size="32px"
        font-weight="700"
        color="#14B8A6"
        padding-bottom="8px"
      >
        {{milestoneName}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Progress Stats -->
  <mj-section background-color="#ffffff" padding="0 24px 24px">
    <mj-column background-color="#ECFDF5" border-radius="16px" padding="20px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#059669" padding-bottom="4px">
        TOTAL SAVED
      </mj-text>
      <mj-text align="center" font-size="32px" font-weight="700" color="#047857">
        {{totalSaved}}
      </mj-text>
    </mj-column>
    <mj-column background-color="#F9FAFB" border-radius="16px" padding="20px">
      <mj-text align="center" font-size="12px" font-weight="700" color="#6B7280" padding-bottom="4px">
        GOAL AMOUNT
      </mj-text>
      <mj-text align="center" font-size="32px" font-weight="700" color="#374151">
        {{goalAmount}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- Progress Bar Visual -->
  <mj-section background-color="#F9FAFB" padding="24px">
    <mj-column>
      <mj-text align="center" font-size="14px" font-weight="600" color="#374151" padding-bottom="8px">
        Progress: {{progressPercent}}% Complete
      </mj-text>
      <!-- Progress Bar (HTML table trick for MJML) -->
      <mj-raw>
        <tr>
          <td style="padding: 0 25px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E5E7EB; border-radius:999px; overflow:hidden; height:12px;">
              <tbody>
                <tr>
                  <td style="background: linear-gradient(90deg, #14B8A6, #0EA5E9); height:12px;" width="{{progressPercent}}%"></td>
                  <td style="height:12px;"></td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </mj-raw>
    </mj-column>
  </mj-section>

  <!-- Encouraging Message -->
  <mj-section background-color="#EFF6FF" padding="24px">
    <mj-column>
      <mj-text align="center" font-size="16px" font-weight="600" color="#1E40AF" padding-bottom="8px">
        ✨ Keep Going!
      </mj-text>
      <mj-text align="center" font-size="14px" color="#1D4ED8">
        {{encouragingMessage}}
      </mj-text>
    </mj-column>
  </mj-section>

  <!-- CTA Buttons -->
  <mj-section background-color="#ffffff" padding="24px">
    <mj-column>
      <mj-button href="{{goalsUrl}}" padding-bottom="12px">
        View Savings Goals
      </mj-button>
      <mj-button href="{{newGoalUrl}}" background-color="#8B5CF6" color="#ffffff">
        Create New Goal
      </mj-button>
    </mj-column>
  </mj-section>
`, { subject: "🎉 Savings Milestone Reached: {{milestoneName}}" });

module.exports = savingsMilestone;
