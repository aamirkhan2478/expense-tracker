import PublicPageShell from "@/components/PublicPage/PublicPageShell";
import ContactPageContent from "@/components/PublicPage/ContactPageContent";
import { createMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/constants/site";

const title = "Contact";
const description = `How to reach SpendWise support by email at ${SITE.supportEmail}, what to include in your message, how to reset a password or resend a verification email, and how to report a security issue.`;

export const metadata = createMetadata({
  title,
  description,
  path: "/contact",
});

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Contact", href: "/contact" },
    ]),
    {
      "@type": "ContactPage",
      name: `Contact ${SITE.name}`,
      url: `${SITE.url}/contact`,
    },
  ],
};

export default function ContactPage() {
  return (
    <PublicPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ContactPageContent />
    </PublicPageShell>
  );
}
