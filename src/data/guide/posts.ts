// ⚠️  Copied from spabalimoon.com (28 September 2026): the seven guide articles
// as the live search API returns them, in the live order.

/** One guide article as listed by search and the blog menu. */
export type GuidePostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  author: string;
  published_at: string;
};

export const guidePosts: GuidePostSummary[] = [
  {
    id: "4362c071-2989-4754-8c4c-0b2c76a62543",
    slug: "lymphatic-drainage-massage-benefits-techniques-what-to-expect",
    title: "A Guide To Lymphatic Drainage Massage",
    excerpt: "Lymphatic drainage massage uses light, rhythmic movements to support fluid balance, reduce puffiness and aid recovery. Here is what to expect.",
    cover_image: "/images/guide/lymphatic-drainage-blog-spa-bali-moon.webp",
    author: "Spa Bali Moon",
    published_at: "2026-07-01T07:35:07+00:00"
  },
  {
    id: "deecf868-5652-4fbd-a548-e7bd7b7f3799",
    slug: "what-is-a-balinese-massage",
    title: "What Is a Balinese Massage? A Complete Guide for First Timer",
    excerpt: "Balinese massage blends flowing strokes, acupressure, stretching and aromatherapy. Here is what first timers can expect from Bali’s signature treatment.",
    cover_image: "/images/guide/balinese-massage-blog-spa-bali-moon.webp",
    author: "Spa Bali Moon",
    published_at: "2026-06-24T08:59:15+00:00"
  },
  {
    id: "2c272ff9-6c51-49a3-a8cc-04045bb40681",
    slug: "what-is-thai-massage",
    title: "Thai Massage Benefits & Techniques Explained",
    excerpt: "Thai massage combines assisted stretching, acupressure and rhythmic compression to improve flexibility, ease stiffness and restore mobility.",
    cover_image: "/images/guide/thai-massage-blog-spa-bali-moon.webp",
    author: "Spa Bali Moon",
    published_at: "2026-06-24T08:57:11+00:00"
  },
  {
    id: "fbd36b92-97a3-4de1-9cb2-d92ff13a7779",
    slug: "understanding-of-facial-massage",
    title: "Facial Massage Benefits for Modern Self‑Care",
    excerpt: "Facial massage has grown from a beauty add-on into a wellness ritual. Here is how it eases facial tension and supports your skincare routine.",
    cover_image: "/images/guide/facial-massage-blog-spa-bali-moon.webp",
    author: "Spa Bali Moon",
    published_at: "2026-06-24T08:55:11+00:00"
  },
  {
    id: "4f737365-5e7f-4a08-8984-0bbb7604ea22",
    slug: "understanding-slimming-massage",
    title: "Slimming Massage Benefits & How It Works",
    excerpt: "Slimming massage targets circulation and fluid retention to support body contouring goals. Here is how it works and what results to expect.",
    cover_image: "/images/guide/slimming-massage-blog-spa-bali-moon.webp",
    author: "Spa Bali Moon",
    published_at: "2026-06-24T08:54:12+00:00"
  },
  {
    id: "e43f13d1-dae2-41b7-b0b5-ce8bd5b55533",
    slug: "best-massages-after-a-long-flight",
    title: "Best Massages for Jet Lag Recovery After a Long Flight",
    excerpt: "Long flights leave the body stiff, tired and out of sync. Here are the spa treatments that help you recover fastest after landing in Bali.",
    cover_image: "/images/guide/jet-lag-recovery-blog-spa-bali-moon.webp",
    author: "Spa Bali Moon",
    published_at: "2026-06-09T08:28:30+00:00"
  },
  {
    id: "66f82278-899b-4e04-990e-081685849336",
    slug: "iv-drip",
    title: "IV Drip Therapy in Bali",
    excerpt: "A 20-minute IV drip delivers fluids and vitamins straight into the bloodstream to support hydration, energy and recovery while you travel in Bali.",
    cover_image: "/images/guide/iv-drip-therapy-banner-1024x576.webp",
    author: "Spa Bali Moon",
    published_at: "2024-12-09T07:04:38+00:00"
  }
];
