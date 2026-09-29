import type { Metadata } from "next";
import Body from "@/content/pages/privacy-policy";
import { privacyPolicyPage as page } from "@/data/pages/privacy-policy";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: page.seo.title,
  description: page.seo.description,
  path: page.path,
});

/** /privacy-policy/ — the live page (src/content/pages/privacy-policy.tsx). */
export default function PrivacyPolicyPage() {
  return <Body />;
}
