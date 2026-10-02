import { getMenuPosts, searchPublishedPosts } from "@/lib/blog/posts";

/**
 * Guide search — the live /api/search-posts/ contract:
 *   ?menu=1  the 12 newest posts (id, slug, title), for the blog menu
 *   ?q=…     up to 10 posts whose title or excerpt contains the query
 *            (case-insensitive, at least 2 characters)
 *   anything else: an empty list
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (params.get("menu") === "1") {
    try {
      return Response.json({ posts: await getMenuPosts() });
    } catch (e) {
      console.error("Blog menu error:", e instanceof Error ? e.message : e);
      return Response.json({ error: "Could not load blog menu" }, { status: 500 });
    }
  }
  const q = (params.get("q") || "").trim();
  if (q.length < 2) return Response.json({ posts: [] });
  try {
    return Response.json({ posts: await searchPublishedPosts(q) });
  } catch (e) {
    console.error("Search error:", e instanceof Error ? e.message : e);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
