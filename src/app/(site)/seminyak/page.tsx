import type { Metadata } from "next";
import PackageGroups from "@/components/pricelist/PackageGroups";
import FaqSection from "@/components/sections/FaqSection";
import PackageIntro from "@/components/sections/PackageIntro";
import PackageTabs from "@/components/sections/PackageTabs";
import PageBanner from "@/components/sections/PageBanner";
import ReserveCta from "@/components/sections/ReserveCta";
import Testimonials from "@/components/sections/Testimonials";
import VideoSection from "@/components/sections/VideoSection";
import { pricelistPage as page } from "@/data/pages/pricelist";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: page.seo.title,
  description: page.seo.description,
  path: page.path,
});

/** Two words, a line break, the rest — how the live page sets the two facts. */
const stat = ([first, rest]: [string, string]) => (
  <>
    {`${first} `}
    <br className="jsx-pricelist" />
    {` ${rest}`}
  </>
);

/**
 * /seminyak/ — the price list, section for section as live. `p-pricelist`
 * scopes the page's own live styles (src/styles/live.css).
 */
export default function PricelistPage() {
  const { menu } = page;
  return (
    <div className="page-wrapper lh p-pricelist">
      <PageBanner {...page.banner} />
      <VideoSection {...menu} firstStat={stat(menu.firstStat)} secondStat={stat(menu.secondStat)} />
      <div className="jsx-pricelist pricing-package-section">
        <PackageTabs {...page.priceList} spreadDropdownArrow />
      </div>
      <PackageIntro {...page.packagesIntro} />
      <PackageGroups groups={page.packageGroups} icons={page.packageIcons} />
      <Testimonials />
      <div className="jsx-pricelist pricing-faq-section">
        <FaqSection {...page.faq} />
      </div>
      <div className="jsx-pricelist pricing-closing-section section__decoration-top section__decoration-bottom bg-sub">
        <ReserveCta standardSpacing {...page.reserve} />
      </div>
    </div>
  );
}
