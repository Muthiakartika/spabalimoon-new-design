import type { Metadata } from "next";
import Body from "@/content/pages/terms-and-conditions";
import { termsPage as page } from "@/data/pages/terms-and-conditions";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: page.seo.title,
  description: page.seo.description,
  path: page.path,
});

/** /terms-and-conditions/ — the live page (src/content/pages/terms-and-conditions.tsx). */
export default function TermsAndConditionsPage() {
  return <Body />;
}
