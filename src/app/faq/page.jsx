import PublicPageShell from "@/components/PublicPage/PublicPageShell";
import FaqPageContent from "@/components/PublicPage/FaqPageContent";
import { faqFlat } from "@/content/faq";
import { createMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";

const title = "Frequently Asked Questions";
const description =
  "Answers about setting up SpendWise, logging income and expenses, budgets and carry-forward, recurring entries, CSV import and export, reports, settings, and how your account and data are handled.";

export const metadata = createMetadata({
  title,
  description,
  path: "/faq",
});

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    faqJsonLd(faqFlat),
    breadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "FAQ", href: "/faq" },
    ]),
  ],
};

export default function FaqPage() {
  return (
    <PublicPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <FaqPageContent />
    </PublicPageShell>
  );
}
