import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { mobileMenuData } from "@/components/layout/mobileMenuData";

/** Every page except the 404: header, the page inside <main>, footer. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Lets keyboard users skip the 23-item treatments menu */}
      <a
        href="#main-content"
        className="sr-only rounded bg-ink px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
      >
        Skip to content
      </a>
      <Header menu={await mobileMenuData()} />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
