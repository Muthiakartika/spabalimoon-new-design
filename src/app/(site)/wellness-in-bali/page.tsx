import type { Metadata } from "next";
import Body from "@/content/pages/wellness-in-bali";
import { wellnessPage as page } from "@/data/pages/wellness-in-bali";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: page.seo.title,
  description: page.seo.description,
  path: page.path,
});

/** /wellness-in-bali/ — the live page (src/content/pages/wellness-in-bali.tsx). */
export default function WellnessInBaliPage() {
  return <Body />;
}
