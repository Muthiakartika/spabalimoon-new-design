import type { Metadata } from "next";
import Body from "@/content/pages/reservation";
import { reservationPage } from "@/data/pages/reservation";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: reservationPage.seo.title,
  description: reservationPage.seo.description,
  path: reservationPage.path,
});

/** /reservation/ — the live page (src/content/pages/reservation.tsx); its H1 is "Book Your Treatment" (live has none). */
export default function ReservationPage() {
  return <Body />;
}
