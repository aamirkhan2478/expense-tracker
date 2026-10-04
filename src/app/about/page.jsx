import PublicPageShell from "@/components/PublicPage/PublicPageShell";
import AboutPageContent from "@/components/PublicPage/AboutPageContent";
import { createMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/constants/site";

const title = "About";
const description = `What SpendWise is, who it is built for, the reasoning behind its daily budget model, and the boundaries it deliberately keeps — no bank connections, no paid plans, no analytics.`;

export const metadata = createMetadata({
  title,
  description,
  path: "/about",
});

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },
    ]),
    {
      "@type": "AboutPage",
      name: `About ${SITE.name}`,
      url: `${SITE.url}/about`,
      mainEntity: {
        "@type": "SoftwareApplication",
        name: SITE.name,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        description: SITE.description,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    },
  ],
};

export default function AboutPage() {
  return (
    <PublicPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <AboutPageContent />
    </PublicPageShell>
  );
}
