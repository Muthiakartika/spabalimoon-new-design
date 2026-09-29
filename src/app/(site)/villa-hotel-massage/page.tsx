import type { Metadata } from "next";
import Body from "@/content/pages/villa-hotel-massage";
import { villaHotelPage as page } from "@/data/pages/villa-hotel-massage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: page.seo.title,
  description: page.seo.description,
  path: page.path,
});

/** /villa-hotel-massage/ — the live page, built from the shared live sections (src/content/pages/villa-hotel-massage.tsx). */
export default function VillaHotelMassagePage() {
  return <Body />;
}
