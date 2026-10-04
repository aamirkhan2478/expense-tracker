import PublicPageShell from "@/components/PublicPage/PublicPageShell";
import FeaturesPageContent from "@/components/PublicPage/FeaturesPageContent";
import { createMetadata, breadcrumbJsonLd } from "@/lib/seo";

const title = "Features";
const description =
  "SpendWise features: expense and income tracking, categories with limits, daily budgets with carry-forward, recurring entries, reports and charts, browser-side CSV import, CSV and JSON export, and email alerts you control.";

export const metadata = createMetadata({
  title,
  description,
  path: "/features",
});

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Features", href: "/features" },
    ]),
    {
      "@type": "SoftwareApplication",
      name: "SpendWise",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      description:
        "Self-hosted personal finance tracker for expenses, income, categories, budgets, and reports.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Expense tracking",
        "Income tracking",
        "Category budgets",
        "Daily budget with carry-forward",
        "Recurring entries",
        "Reports and charts",
        "CSV import",
        "CSV and JSON export",
        "Configurable email notifications",
      ],
    },
  ],
};

export default function FeaturesPage() {
  return (
    <PublicPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <FeaturesPageContent />
    </PublicPageShell>
  );
}
