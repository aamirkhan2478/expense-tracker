import PublicPageShell from "@/components/PublicPage/PublicPageShell";
import LegalDocument from "@/components/PublicPage/LegalDocument";
import { termsOfService } from "@/content/legal/terms";
import { createMetadata } from "@/lib/seo";

const title = "Terms of Service";
const description =
  "The terms that govern your use of SpendWise: what the software does and does not do, account responsibilities, acceptable use, ownership of your data, backups, availability, termination, disclaimers, and liability limits.";

export const metadata = createMetadata({
  title,
  description,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <PublicPageShell>
      <LegalDocument doc={termsOfService} />
    </PublicPageShell>
  );
}
