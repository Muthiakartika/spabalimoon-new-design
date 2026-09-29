import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { guideArticles } from "@/content/guide";
import { blogPosts, getBlogPost } from "@/data/blog";
import { guidePosts } from "@/data/guide/posts";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seoTitle,
    description: post.seoDescription,
    path: `/guide/${post.slug}/`,
    type: "article",
    // The live cover picture (src/data/guide/posts.ts holds the live paths).
    shareImage: guidePosts.find((p) => p.slug === post.slug)?.cover_image,
  });
}

/** A guide article — its body is in src/content/guide/<slug>.tsx, built from the live page. */
export default async function GuideArticlePage({ params }: Props) {
  const { slug } = await params;
  const Body = guideArticles[slug];
  if (!Body) notFound();
  return <Body />;
}
