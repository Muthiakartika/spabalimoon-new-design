import { allTreatments } from "@/components/home/treatments";
import { guidePosts } from "@/data/guide/posts";
import { blogMenu, treatmentMenu } from "@/data/navigation";

/** One row in the mobile menu's Treatments or Blog panel. */
export type MobileMenuEntry = { label: string; href: string; image: string; note?: string };
export type MobileMenuGroup = { title: string; items: MobileMenuEntry[] };
export type MobileMenuData = { treatments: MobileMenuGroup[]; posts: MobileMenuEntry[] };

/**
 * What the mobile menu's two inner panels list, built on the server and handed
 * to the (client) header as props, so the treatment and guide data stays out
 * of every page's JavaScript.
 *  - Treatments: the header's 23 treatments in their menu order and wording,
 *    split into massage and beauty as the homepage menu does, each with the
 *    homepage slider's photo and starting price ("From IDR 159K").
 *  - Blog: the articles in the blog menu, in its order, with their cover photos.
 */
export function mobileMenuData(): MobileMenuData {
  const entries = treatmentMenu.map((t) => {
    const card = allTreatments.find((a) => a.href === t.href);
    return {
      group: card?.group ?? "massage",
      entry: { label: t.label, href: t.href, image: card?.image ?? "", note: card?.price ?? undefined },
    };
  });
  return {
    treatments: [
      { title: "Massage", items: entries.filter((e) => e.group === "massage").map((e) => e.entry) },
      { title: "Beauty & Body", items: entries.filter((e) => e.group === "beauty").map((e) => e.entry) },
    ],
    posts: blogMenu.map((b) => ({
      label: b.label,
      href: b.href,
      image: guidePosts.find((p) => b.href === `/guide/${p.slug}/`)?.cover_image ?? "",
    })),
  };
}
