import type { Metadata } from "next";
import GuideArchive from "@/components/sections/GuideArchive";
import { blogArchivePage } from "@/data/pages/blog";
import { getPublishedPosts } from "@/lib/blog/posts";
import { buildMetadata } from "@/lib/seo";

// Built once and kept until an article is saved in /admin/ (which rebuilds it),
// so visitors never wake the database. A database error while rebuilding is
// thrown on purpose: Next then keeps serving the last good page.
export const revalidate = false;

export const metadata: Metadata = buildMetadata({
  title: blogArchivePage.seo.title,
  description: blogArchivePage.seo.description,
  path: blogArchivePage.path,
});

/** /guide/ — every published article, newest first. */
export default async function GuideArchivePage() {
  return <GuideArchive posts={await getPublishedPosts()} />;
}
