import type { Metadata } from "next";
import About from "@/components/home/About";
import Faq from "@/components/home/Faq";
import FeaturedTreatments from "@/components/home/FeaturedTreatments";
import Hero from "@/components/home/Hero";
import PackageIntro from "@/components/sections/PackageIntro";
import Packages from "@/components/home/Packages";
import ReserveCta from "@/components/home/ReserveCta";
import Steps from "@/components/home/Steps";
import Testimonials from "@/components/sections/Testimonials";
import TreatmentCatalog from "@/components/home/TreatmentCatalog";
import WhyDifferent from "@/components/home/WhyDifferent";
import { home } from "@/data/pages/home";
import { buildMetadata } from "@/lib/seo";

// Canonical, robots and Open Graph tags, as on live.
export const metadata: Metadata = buildMetadata({ title: home.seo.title, description: home.seo.description, path: "/" });

/**
 * Homepage — the live page, section for section, in the live order. The
 * wrapper carries `page-wrapper` (the live homepage styles hang off it) and
 * `lh`, which switches on the live theme in src/styles/live.css.
 */
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(home.seo.schema).replace(/</g, "\\u003c") }}
      />
      <div className="page-wrapper lh p-home">
        <Hero />
        <Steps />
        <About />
        <FeaturedTreatments />
        <Testimonials />
        <TreatmentCatalog />
        <PackageIntro {...home.packageIntro} />
        <Packages />
        <WhyDifferent />
        <Faq />
        <ReserveCta />
      </div>
    </>
  );
}
