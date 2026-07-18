import { Schema, model, models } from "mongoose";

const EmailSettingsSchema = new Schema(
  {
    enabledTemplates: {
      loginNotification: { type: Boolean, default: true },
      largeExpenseAlert: { type: Boolean, default: true },
      upcomingReminder: { type: Boolean, default: true },
      weeklySummary: { type: Boolean, default: true },
      recurringBatchSummary: { type: Boolean, default: true },
      overspendingAlert: { type: Boolean, default: true },
      savingsMilestone: { type: Boolean, default: true },
      bulkImportSummary: { type: Boolean, default: true },
      budgetWarning: { type: Boolean, default: true },
      budgetExceeded: { type: Boolean, default: true },
      failedLogin: { type: Boolean, default: true },
    },
    largeExpenseThreshold: { type: Number, default: 500 },
    overspendingAlertThreshold: { type: Number, default: 1000 },
    reminderSchedule: { type: String, default: "0 9 * * *" }, // daily check at 9am
    weeklySummarySchedule: { type: String, default: "0 9 * * 1" }, // weekly on monday at 9am
  },
  { timestamps: true }
);

const EmailSettings = models.EmailSettings || model("EmailSettings", EmailSettingsSchema);

export default EmailSettings;
