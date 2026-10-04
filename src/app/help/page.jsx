import PublicPageShell from "@/components/PublicPage/PublicPageShell";
import HelpPageContent from "@/components/PublicPage/HelpPageContent";
import { createMetadata, breadcrumbJsonLd } from "@/lib/seo";

const title = "Help";
const description =
  "Step-by-step guides for SpendWise: setting up an account, recording transactions, understanding daily budgets and carry-forward, recurring entries, CSV import, exporting backups, email notifications, and reading reports.";

export const metadata = createMetadata({
  title,
  description,
  path: "/help",
});

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Help", href: "/help" },
    ]),
    {
      "@type": "HowTo",
      name: "How to record your first expense in SpendWise",
      description:
        "Create a category, then add an expense with a title, amount, date, and category so it appears in your dashboard and reports.",
      step: [
        {
          "@type": "HowToStep",
          name: "Create a category",
          text: "Open the Categories page and add the category you want to track.",
        },
        {
          "@type": "HowToStep",
          name: "Add the expense",
          text: "Open the Expenses page and record a title, amount, date, and category.",
        },
        {
          "@type": "HowToStep",
          name: "Check the total",
          text: "Open the dashboard to see the expense reflected in your totals and budget figures.",
        },
      ],
    },
  ],
};

export default function HelpPage() {
  return (
    <PublicPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <HelpPageContent />
    </PublicPageShell>
  );
}
