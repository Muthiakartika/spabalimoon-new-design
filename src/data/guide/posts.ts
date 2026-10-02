// The seven built-in guide articles (seed-posts.json, copied from spabalimoon.com
// on 28 September 2026), in the live order. The articles themselves now come
// from the blog database (src/lib/blog/posts.ts); this list only feeds the
// mobile menu's Blog panel, which follows the fixed blogMenu in navigation.ts.
import seedPosts from "./seed-posts.json";

/** One guide article as listed by the blog menu. */
export type GuidePostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  author: string;
  published_at: string;
};

export const guidePosts: GuidePostSummary[] = seedPosts.map(
  ({ id, slug, title, excerpt, cover_image, author, published_at }) => ({
    id,
    slug,
    title,
    excerpt,
    cover_image,
    author,
    published_at,
  })
);
