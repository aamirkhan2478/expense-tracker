import PublicPageShell from "@/components/PublicPage/PublicPageShell";
import LegalDocument from "@/components/PublicPage/LegalDocument";
import { disclaimer } from "@/content/legal/disclaimer";
import { createMetadata } from "@/lib/seo";

const title = "Disclaimer";
const description =
  "SpendWise is a self-hosted record-keeping tool, not a financial service. Read what the software does not do, how accurate its figures are, and the limits of its availability and liability.";

export const metadata = createMetadata({
  title,
  description,
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <PublicPageShell>
      <LegalDocument doc={disclaimer} />
    </PublicPageShell>
  );
}
