import type { Metadata } from "next";
import Body from "@/content/pages/reservation";
import { reservationPage } from "@/data/pages/reservation";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: reservationPage.seo.title,
  description: reservationPage.seo.description,
  path: reservationPage.path,
});

/** /reservation/ — the live page (src/content/pages/reservation.tsx); like live it has no H1. */
export default function ReservationPage() {
  return <Body />;
}
