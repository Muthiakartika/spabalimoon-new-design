import type { Metadata } from "next";
import Body from "@/content/pages/massage-kuta";
import { kutaPage as page } from "@/data/pages/massage-kuta";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: page.seo.title,
  description: page.seo.description,
  path: page.path,
});

/** /massage-kuta/ — the live page, built from the shared live sections (src/content/pages/massage-kuta.tsx). */
export default function MassageKutaPage() {
  return <Body />;
}
