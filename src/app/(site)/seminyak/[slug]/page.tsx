import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { treatmentPages } from "@/content/treatments";
import { getTreatment, treatments } from "@/data/treatments";
import { buildMetadata } from "@/lib/seo";

/**
 * Treatment pages: /seminyak/balinese-massage/, /seminyak/facial/, …
 *
 * The body of each page is its own file in src/content/treatments/, built
 * from the live page and made of the shared live sections. Titles and
 * descriptions come from src/data/treatments/<slug>.ts.
 */
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return treatments.map((treatment) => ({ slug: treatment.slug }));
}

/** Any other /seminyak/<something>/ address shows the 404 page. */
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const treatment = getTreatment(slug);
  if (!treatment) return {};
  return buildMetadata({
    title: treatment.seo.title,
    description: treatment.seo.description,
    path: `/seminyak/${treatment.slug}/`,
  });
}

export default async function TreatmentPage({ params }: Props) {
  const { slug } = await params;
  const Body = treatmentPages[slug];
  if (!Body) notFound();
  return <Body />;
}
