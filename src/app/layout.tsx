import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import Preloader from "@/components/layout/Preloader";
import SmoothScroll from "@/components/layout/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { business } from "@/data/business";
import "./globals.css";
import "../styles/live.css";

/**
 * Defaults for search engines and social sharing. The title and description
 * below are the live homepage's, byte for byte; each page overrides them.
 */
export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: "Spa Bali Moon - Outcall & Home Service Massage",
  description:
    "Our traditional Bali massage is available for outcall massage to your stay. Visit our spa or call for home service. Feel the signature warmth of Bali Moon.",
  icons: { shortcut: "/images/SMBlogo.ico" },
  openGraph: {
    siteName: business.name,
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
};

/**
 * What every page shares, the 404 included: styles, fonts, the WhatsApp
 * button, the preloader and smooth scrolling. The header, <main> and footer
 * live in (site)/layout.tsx — the live 404 page has neither header nor footer.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The live site preloads the Latin subsets of its two families.
  preload("/webfonts/or3hQ6P12-iJxAIgLYTwJrUXnTPm.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload("/webfonts/1Ptvg83HX_SGhgqk3wotYKNnBQ.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang="en">
      <body>
        {children}
        <FloatingWhatsApp />
        <Preloader />
        <SmoothScroll />
        <ScrollReveal />
      </body>
    </html>
  );
}
