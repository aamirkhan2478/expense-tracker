import PublicPageShell from "@/components/PublicPage/PublicPageShell";
import LegalDocument from "@/components/PublicPage/LegalDocument";
import { cookiePolicy } from "@/content/legal/cookies";
import { createMetadata } from "@/lib/seo";

const title = "Cookie Policy";
const description =
  "The cookies and browser storage SpendWise uses, what each one does, how long they last, and how to clear them. SpendWise sets no advertising, analytics, or third-party tracking cookies.";

export const metadata = createMetadata({
  title,
  description,
  path: "/cookies",
});

export default function CookiePolicyPage() {
  return (
    <PublicPageShell>
      <LegalDocument doc={cookiePolicy} />
    </PublicPageShell>
  );
}
