const DEFAULT_APP_URL = "http://localhost:3000";

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;

export const SITE_URL = rawAppUrl.replace(/\/+$/, "");

export const SITE = {
  name: "SpendWise",
  tagline: "Personal expense, income and budget tracking",
  description:
    "SpendWise is a self-hosted expense and income tracker. Record transactions, organise categories, set monthly and daily budgets with carry-forward, add recurring entries, and turn your history into charts and reports.",
  url: SITE_URL,
  locale: "en_US",
  language: "en",
  themeColor: "#14B8A6",
  supportEmail:
    process.env.EMAIL_SUPPORT_EMAIL || "support@spendwise.smartinvoicegen.online",
  contactEmail:
    process.env.EMAIL_SUPPORT_EMAIL || "support@spendwise.smartinvoicegen.online",
  privacyEmail:
    process.env.EMAIL_SUPPORT_EMAIL || "support@spendwise.smartinvoicegen.online",
  legalEmail:
    process.env.EMAIL_SUPPORT_EMAIL || "support@spendwise.smartinvoicegen.online",
  securityEmail:
    process.env.EMAIL_SUPPORT_EMAIL || "support@spendwise.smartinvoicegen.online",
  twitterHandle: "",
};

export const PUBLIC_ROUTES = [
  { path: "/", label: "Home", priority: 1.0, changefreq: "weekly" },
  { path: "/features", label: "Features", priority: 0.9, changefreq: "monthly" },
  { path: "/about", label: "About", priority: 0.6, changefreq: "yearly" },
  { path: "/faq", label: "FAQ", priority: 0.7, changefreq: "monthly" },
  { path: "/help", label: "Help", priority: 0.7, changefreq: "monthly" },
  { path: "/contact", label: "Contact", priority: 0.6, changefreq: "yearly" },
  { path: "/privacy", label: "Privacy Policy", priority: 0.5, changefreq: "yearly" },
  { path: "/terms", label: "Terms of Service", priority: 0.5, changefreq: "yearly" },
  { path: "/cookies", label: "Cookie Policy", priority: 0.3, changefreq: "yearly" },
  { path: "/disclaimer", label: "Disclaimer", priority: 0.3, changefreq: "yearly" },
];

export const PRIVATE_ROUTE_PREFIXES = [
  "/dashboard",
  "/expense",
  "/income",
  "/category",
  "/reports",
  "/settings",
  "/admin",
  "/profile",
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/resend-verification",
  "/api",
];

export const absoluteUrl = (path = "/") => `${SITE.url}${path}`;

export const LEGAL_LAST_UPDATED = "January 12, 2026";

export default SITE;
