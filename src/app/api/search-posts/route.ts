import { guidePosts } from "@/data/guide/posts";

/**
 * Guide search — the live /api/search-posts/ contract:
 *   ?menu=1  every post (id, slug, title), for the blog menu
 *   ?q=…     posts whose title or excerpt contains the query (case-insensitive,
 *            at least 2 characters)
 *   anything else: an empty list
 */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (params.get("menu") === "1") {
    return Response.json({ posts: guidePosts.map(({ id, slug, title }) => ({ id, slug, title })) });
  }
  const q = (params.get("q") || "").trim().toLowerCase();
  if (q.length < 2) return Response.json({ posts: [] });
  const posts = guidePosts.filter((p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q));
  return Response.json({ posts });
}
