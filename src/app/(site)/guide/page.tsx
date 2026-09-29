import type { Metadata } from "next";
import Body from "@/content/pages/guide";
import { blogArchivePage } from "@/data/pages/blog";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: blogArchivePage.seo.title,
  description: blogArchivePage.seo.description,
  path: blogArchivePage.path,
});

/** /guide/ — the live blog archive (src/content/pages/guide.tsx). */
export default function GuideArchivePage() {
  return <Body />;
}
