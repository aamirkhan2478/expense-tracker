export const faqCategories = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: "rocket",
    items: [
      {
        question: "What is SpendWise and who is it for?",
        answer:
          "SpendWise is a self-hosted web app for tracking personal finances. It suits anyone who wants a clear record of where their money goes: log income and expenses, sort them into categories, set monthly and daily budgets, schedule recurring bills, and see reports. Because it is self-hosted, you or whoever operates your instance holds the data.",
      },
      {
        question: "How much does SpendWise cost?",
        answer:
          "There are no paid plans, subscriptions, or usage credits. SpendWise has no billing system at all, so there is nothing to pay and no payment details to enter.",
      },
      {
        question: "Do I need a credit card to sign up?",
        answer:
          "No. Registration asks only for a name, email address, and a password of at least 8 characters. SpendWise never asks for card details.",
      },
      {
        question: "Why do I have to verify my email address?",
        answer:
          "Verification confirms that the address can receive mail, which matters because password resets and account notifications are delivered by email. A verification link is valid for 24 hours, and you can request a new one from the sign-in page if it expires.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "Use the Forgot Password link on the sign-in page and enter your email address. If an account matches, SpendWise emails a reset link that is valid for 1 hour. The link can only be used once and only on the address it was issued for.",
      },
      {
        question: "My account is locked after too many sign-in attempts. What now?",
        answer:
          "Five consecutive failed sign-in attempts lock an account for 30 minutes as a safeguard against password guessing. After the lock expires you can sign in again with the correct password.",
      },
    ],
  },
  {
    id: "tracking-money",
    title: "Tracking money",
    icon: "chart",
    items: [
      {
        question: "What fields does an expense or income entry need?",
        answer:
          "An expense needs a title, an amount, a date, and a category. An income entry needs a company name or source, a title, an amount, and a date. Every entry can also carry a note and a payment method.",
      },
      {
        question: "Can I set a limit for a category as well as for the month?",
        answer:
          "Yes. Each category can carry its own budget, and the Categories page shows how much of it has been used against the total spent in that category.",
      },
      {
        question: "What is the difference between a daily budget and a monthly budget?",
        answer:
          "The monthly budget is your total allowance for the month. SpendWise divides it by the number of days to get a daily base budget, then works out what is left of earlier days and adds that carry-forward to today. Overspending early reduces what remains for the rest of the month, and underspending carries forward. A new month starts fresh from its own configured budget rather than inheriting the previous month's balance.",
      },
      {
        question: "What happens to my budget if I overspend?",
        answer:
          "Carry-forward can go negative. If you have spent more than the daily allowance allows, the amount available for today drops accordingly, and the dashboard shows the shortfall instead of hiding it.",
      },
      {
        question: "Does SpendWise connect to my bank?",
        answer:
          "No. SpendWise never connects to a bank, card issuer, or payment network, and it does not ask for bank credentials or card numbers. Every figure in the app comes from what you enter or import, which also means SpendWise cannot verify that those figures are correct.",
      },
      {
        question: "Can I track income from more than one source?",
        answer:
          "Yes. Income entries record the source, so salary, freelance work, and other streams can be tracked separately and totalled together over any period.",
      },
    ],
  },
  {
    id: "recurring-and-reminders",
    title: "Recurring entries and reminders",
    icon: "repeat",
    items: [
      {
        question: "How do I record a recurring bill or salary?",
        answer:
          "Mark an entry as recurring and choose a frequency — daily, weekly, monthly, or yearly. The recurrence field is only required for entries you mark as recurring, so ordinary one-off entries are unaffected.",
      },
      {
        question: "Can I filter my list to see only recurring entries?",
        answer:
          "Yes. Both the Expenses and Income pages have a recurring filter that lets you switch between all entries and recurring ones only, so you can review subscriptions and regular income without the rest of the list.",
      },
      {
        question: "Will I be reminded before a recurring entry is due?",
        answer:
          "SpendWise can send a reminder email ahead of a recurring entry. How far in advance is configurable in Settings, along with the day of the week you want weekly summaries sent.",
      },
    ],
  },
  {
    id: "data-import-export",
    title: "Importing and exporting",
    icon: "download",
    items: [
      {
        question: "What file formats can I import?",
        answer:
          "CSV. The Expenses page accepts .csv files and includes a sample file showing the expected columns: title, amount, expenseDate, and category.",
      },
      {
        question: "Does my CSV file get uploaded to your servers?",
        answer:
          "No. The spreadsheet is read in your browser and only the resulting transaction records are sent to the app. The file itself is never uploaded or stored. For the same reason, exports are generated on your device and downloaded directly.",
      },
      {
        question: "How are categories matched during a CSV import?",
        answer:
          "The category column is matched by name against categories that already exist in your account. Names that do not match anything are reported to you instead of being created automatically, so a typo cannot quietly create a duplicate category.",
      },
      {
        question: "Can I get my data out?",
        answer:
          "Yes. Expense and income lists can be exported as CSV or JSON. Because exports are produced in your browser, this is also the quickest way to keep your own backup.",
      },
    ],
  },
  {
    id: "reports-settings",
    title: "Reports and settings",
    icon: "settings",
    items: [
      {
        question: "What do the reports show?",
        answer:
          "Reports break your history down by month and by category, summarise spending against income over time, and highlight your highest and lowest individual entries so outliers are easy to spot.",
      },
      {
        question: "Can I use a different currency or date format?",
        answer:
          "Yes. Currency and date format are configurable in Settings, along with how many rows each list shows per page. Date format and rows-per-page choices save as soon as you change them.",
      },
      {
        question: "Does SpendWise work on a phone?",
        answer:
          "Yes. The interface is responsive and adapts to desktop, tablet, and mobile screens.",
      },
      {
        question: "Which email notifications can I control?",
        answer:
          "Each notification type can be switched on or off individually in Settings, including budget warnings, overspending alerts, large-expense alerts, weekly summaries, recurring-entry summaries, savings milestones, login notifications, and import summaries. Verification and password-reset emails are always sent because they are needed for account access and security.",
      },
      {
        question: "Is my financial data used for anything else?",
        answer:
          "No. SpendWise runs no analytics, no advertising, and no artificial intelligence analysis of your finances, and it does not sell your data. What it collects is covered in the Privacy Policy.",
      },
    ],
  },
  {
    id: "account-and-security",
    title: "Account and security",
    icon: "shield",
    items: [
      {
        question: "How is my password stored?",
        answer:
          "It is hashed with bcrypt using a cost factor of 12. Your actual password is never stored or written to logs, and it cannot be read back or recovered — only replaced.",
      },
      {
        question: "How long do I stay signed in?",
        answer:
          "A normal session lasts 24 hours. Choosing Remember me extends it to 30 days. Signing out clears the session cookies immediately.",
      },
      {
        question: "Can I delete my account and data?",
        answer:
          "There is no self-service deletion button in the app yet. To have your account and records removed, contact the operator of the instance using the support address on the Contact page and ask for deletion.",
      },
      {
        question: "Does SpendWise host my money or move it?",
        answer:
          "No. SpendWise is a record-keeping tool, not a bank or payment service. It records the figures you enter and never holds, safeguards, or transfers funds.",
      },
    ],
  },
];

export const faqFlat = faqCategories.flatMap((category) =>
  category.items.map((item) => ({
    ...item,
    answerPlain: item.answer,
    category: category.title,
  }))
);

export default faqCategories;
