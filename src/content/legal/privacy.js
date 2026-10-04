export const privacyPolicy = {
  slug: "privacy",
  title: "Privacy Policy",
  lastUpdated: "January 12, 2026",
  intro:
    "This policy explains what personal and financial data SpendWise collects, why it collects it, who it is shared with, and what control you have over it. SpendWise is a self-hosted application, so the operator of a particular instance is the party actually running the software and holding your data.",
  sections: [
    {
      id: "who-we-are",
      heading: "Who we are",
      blocks: [
        {
          type: "p",
          text: "SpendWise is open, self-hosted personal finance software. When you use a hosted instance of SpendWise, the operator of that instance is the controller of your personal data and is responsible for handling it in line with this policy. If you run SpendWise yourself, you are the controller of your own data and this policy describes what the software does by default.",
        },
        {
          type: "p",
          text: "For any privacy question, data request, or deletion request, contact the instance operator using the support address shown on the Contact page.",
        },
      ],
    },
    {
      id: "data-we-collect",
      heading: "Data we collect",
      blocks: [
        {
          type: "p",
          text: "SpendWise only collects what you enter into it, plus the technical data needed to keep you signed in and secure. Specifically:",
        },
        {
          type: "ul",
          items: [
            "Account data: your name, email address, and a securely hashed version of your password. Your role (standard user or administrator) is also stored.",
            "Financial data you record: income entries, expense entries, categories and category budgets, monthly budget settings, and the dates and amounts attached to them. SpendWise never reads this from your bank — every figure is entered by you or imported from a file you provide.",
            "Authentication and security data: email verification status, hashed verification and password-reset tokens with their expiry times, the date of your last login, and failed-login counters used for rate limiting and temporary account lockout.",
            "Preferences you set: display currency, date format, rows per page, and which email notifications you want to receive along with any alert thresholds you configure.",
            "Email delivery logs: the recipient address, subject, template type, delivery status, timestamps, and the rendered HTML body of each email the system sends, so that administrators can diagnose delivery problems.",
          ],
        },
      ],
    },
    {
      id: "data-we-do-not-collect",
      heading: "Data we do not collect",
      blocks: [
        {
          type: "p",
          text: "SpendWise is deliberately narrow. It does not:",
        },
        {
          type: "ul",
          items: [
            "Connect to your bank, card issuer, or any payment network, and never asks for bank credentials, card numbers, or CVVs.",
            "Sell, rent, or trade your personal data.",
            "Run advertising networks, tracking pixels, third-party analytics, or cross-site behavioural profiling.",
            "Use artificial intelligence or machine learning to analyse your finances.",
            "Fingerprint your device or build a profile about you across other websites.",
          ],
        },
      ],
    },
    {
      id: "files-and-imports",
      heading: "How your files are handled",
      blocks: [
        {
          type: "p",
          text: "CSV import and CSV/JSON export both happen in your browser. When you import a spreadsheet, the file is read locally by your own device and only the resulting transaction records are sent to the server. The original file is never uploaded, stored, or shared. When you export, the file is generated locally and downloaded straight to your device, so a copy of your financial data never passes through our servers on the way out.",
        },
        {
          type: "p",
          text: "SpendWise accepts .csv files for import. Categories in an imported file are matched by name to categories that already exist in your account, and rows that cannot be matched are reported to you rather than silently created.",
        },
      ],
    },
    {
      id: "how-we-use-data",
      heading: "How your data is used",
      blocks: [
        {
          type: "ul",
          items: [
            "To authenticate you, keep you signed in, and protect accounts from password guessing through rate limiting and temporary lockout.",
            "To display the figures you entered: totals, balances, budgets, charts, and reports.",
            "To send the transactional emails you have opted into, such as verification, password reset, budget alerts, and recurring-transaction reminders.",
            "To let the instance administrator review email delivery failures so broken email configuration can be fixed.",
          ],
        },
        {
          type: "p",
          text: "Your financial data is not used for advertising, profiling, model training, or any automated decision about you.",
        },
      ],
    },
    {
      id: "sharing",
      heading: "Who your data is shared with",
      blocks: [
        {
          type: "p",
          text: "SpendWise shares data only with the infrastructure required to operate it, and never for third-party marketing:",
        },
        {
          type: "ul",
          items: [
            "Database hosting: the MongoDB instance configured for this deployment stores your account and financial records.",
            "Email delivery: if email sending is configured, messages are handed to an SMTP provider or Resend, which processes them on our behalf to reach your inbox.",
            "Application hosting: the web server or platform that serves this instance.",
            "Authorities: we may disclose data if we are legally required to do so, for example in response to a valid court order.",
          ],
        },
        {
          type: "p",
          text: "We do not share your financial data with advertisers, data brokers, analytics providers, or social networks.",
        },
      ],
    },
    {
      id: "cookies",
      heading: "Cookies and local storage",
      blocks: [
        {
          type: "p",
          text: "SpendWise uses a small number of cookies and browser storage entries purely to keep you signed in and remember your display preferences. There are no advertising or analytics cookies. The Cookie Policy lists every one of them.",
        },
      ],
    },
    {
      id: "retention",
      heading: "How long data is kept",
      blocks: [
        {
          type: "p",
          text: "Your account and the financial records you create are kept for as long as your account exists. There is no automatic deletion schedule, and the application does not currently provide a self-service account-deletion button, so removal happens on request.",
        },
        {
          type: "p",
          text: "Email delivery logs, including the rendered content of sent emails, are retained until an administrator clears them or the database is removed. Verification and reset tokens expire automatically after 24 hours and 1 hour respectively. Signing out clears your authentication cookies immediately.",
        },
        {
          type: "p",
          text: "If you want your data deleted, email the support address on the Contact page. Because SpendWise may be self-hosted, include enough detail to identify the instance you are writing about.",
        },
      ],
    },
    {
      id: "security",
      heading: "How data is protected",
      blocks: [
        {
          type: "p",
          text: "SpendWise applies the following safeguards:",
        },
        {
          type: "ul",
          items: [
            "Passwords are hashed with bcrypt using a cost factor of 12 and are never stored or logged in readable form.",
            "Email verification and password-reset tokens are stored as SHA-256 hashes rather than plaintext, so a leaked database does not hand over working reset links.",
            "Sessions use signed JSON Web Tokens with defined expiry windows, delivered through cookies marked HttpOnly and Secure in production and restricted with SameSite.",
            "Authentication endpoints are rate limited, and repeated failed sign-in attempts trigger a temporary lockout.",
            "Input received by the server is validated against defined schemas before it is written to the database.",
          ],
        },
        {
          type: "p",
          text: "No online service can promise absolute security. SpendWise is self-hosted software: the operator of an instance is responsible for keeping the host, database, and network configuration secure, and for keeping the software updated. Please use a unique password and do not reuse a password you use elsewhere.",
        },
      ],
    },
    {
      id: "your-rights",
      heading: "Your rights",
      blocks: [
        {
          type: "p",
          text: "Depending on where you live, you may have the right to:",
        },
        {
          type: "ul",
          items: [
            "Get a copy of the personal data the instance holds about you.",
            "Correct inaccurate data, most of which you can edit directly in the app.",
            "Delete your data and close your account.",
            "Receive your data in a portable, machine-readable format — SpendWise can export your records as CSV or JSON.",
            "Object to, or restrict, certain processing.",
            "Withdraw consent where processing relies on it.",
            "Complain to your local data protection authority.",
          ],
        },
        {
          type: "p",
          text: "To exercise any of these rights, email the support address on the Contact page. Because SpendWise is self-hosted, requests are handled by the operator of the instance you use.",
        },
      ],
    },
    {
      id: "children",
      heading: "Children",
      blocks: [
        {
          type: "p",
          text: "SpendWise is a general-audience budgeting tool and is not directed at children. We do not knowingly collect personal information from anyone under 16. If you believe a child has created an account, contact the instance operator so the account can be reviewed and removed.",
        },
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      blocks: [
        {
          type: "p",
          text: "This policy may be updated as the software changes. The revision date at the top of this page always reflects the current version, and material changes will be called out there.",
        },
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      blocks: [
        {
          type: "p",
          text: "Questions, requests, and corrections all go to the support address listed on the Contact page. Please do not send passwords, full payment card numbers, or unredacted financial records by email.",
        },
      ],
    },
  ],
};

export default privacyPolicy;
