import type { Metadata } from "next";
import Body from "@/content/pages/outcall-home-service-massage";
import { homeServicePage as page } from "@/data/pages/home-service";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: page.seo.title,
  description: page.seo.description,
  path: page.path,
});

/** /outcall-home-service-massage/ — the live page, built from the shared live sections. */
export default function OutcallPage() {
  return <Body />;
}
