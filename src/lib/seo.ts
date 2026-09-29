/**
 * SEO helper — builds the <head> tags (title, description, canonical, social sharing)
 * for a page, from the values copied from the old website.
 *
 *   export const metadata = buildMetadata({
 *     title: "…", description: "…", path: "/seminyak/balinese-massage/",
 *   });
 *
 * As on the live site, only the guide articles have a share picture
 * (og:image / twitter:image, URL only), and no page has article dates.
 */
import type { Metadata } from "next";
import { business } from "@/data/business";

type SeoInput = {
  title: string;
  description: string;
  /** URL path of the page, with trailing slash, e.g. "/contact/" */
  path: string;
  /** "article" for blog posts */
  type?: "website" | "article";
  /** Picture shown when the page is shared, as a site path (guide articles only on live). */
  shareImage?: string;
  /** false = hide from Google (only for internal pages) */
  index?: boolean;
};

export function absoluteUrl(path: string): string {
  return new URL(path, business.url).toString();
}

export function buildMetadata({
  title,
  description,
  path,
  type = "website",
  shareImage,
  index = true,
}: SeoInput): Metadata {
  const url = absoluteUrl(path);
  const image = shareImage ? absoluteUrl(shareImage) : undefined;

  return {
    // `absolute` = use exactly this title (the old site's titles are already complete).
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    // The old website's robots value, written as a string to keep its order.
    robots: index ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" : "noindex, nofollow",
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: business.name,
      locale: "en_US",
      ...(image ? { images: image } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: image } : {}),
    },
  };
}
