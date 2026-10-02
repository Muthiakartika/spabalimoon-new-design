import { revalidatePath } from "next/cache";
import { absoluteUrl } from "@/lib/seo";
import { purgeUrls } from "./cloudflare";

/**
 * After an article is created, edited or deleted: rebuild the pages that show
 * it, then drop Cloudflare's copies. The guide pages are cached until this
 * runs (they have no time-based revalidation), so it is what makes a save
 * visible.
 *
 * Every article page lists the latest posts and its neighbours, so all of them
 * are rebuilt, not just the one saved. Pass `previousSlug` when an edit
 * renamed the article, so the old URL is purged too. (sitemap.xml is
 * rendered per request; only its Cloudflare copy needs dropping.)
 *
 * In a route handler Next applies revalidatePath just after the response is
 * sent, so a request in those few milliseconds can still get the old page.
 *
 * Never throws: the database write already succeeded.
 */
export async function refreshGuidePages({ slug, previousSlug }: { slug?: string | null; previousSlug?: string | null }) {
  try {
    revalidatePath("/guide");
    revalidatePath("/(site)/guide/[slug]", "page");
  } catch (e) {
    console.error("revalidate failed:", e instanceof Error ? e.message : e);
  }

  const slugs = [...new Set([slug, previousSlug].filter((s): s is string => Boolean(s)))];
  return purgeUrls([
    absoluteUrl("/guide/"),
    ...slugs.map((s) => absoluteUrl(`/guide/${s}/`)),
    absoluteUrl("/sitemap.xml"),
  ]);
}
