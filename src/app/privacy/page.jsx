import PublicPageShell from "@/components/PublicPage/PublicPageShell";
import LegalDocument from "@/components/PublicPage/LegalDocument";
import { privacyPolicy } from "@/content/legal/privacy";
import { createMetadata } from "@/lib/seo";

const title = "Privacy Policy";
const description =
  "How SpendWise handles your data: the account, financial, and technical information it stores, what it never collects, who it shares data with, how long records are kept, and the rights you have over your information.";

export const metadata = createMetadata({
  title,
  description,
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <PublicPageShell>
      <LegalDocument doc={privacyPolicy} />
    </PublicPageShell>
  );
}
