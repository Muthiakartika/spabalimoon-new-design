import type { Metadata } from "next";
import Body from "@/content/pages/contact";
import { contactPage } from "@/data/pages/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: contactPage.seo.title,
  description: contactPage.seo.description,
  path: contactPage.path,
});

/** /contact/ — the live page (src/content/pages/contact.tsx). */
export default function ContactPage() {
  return <Body />;
}
