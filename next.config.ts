import type { NextConfig } from "next";
import { liveRedirects } from "./src/data/redirects";

const nextConfig: NextConfig = {
  // Every URL ends with "/" — exactly like the old website (SEO: keep URLs identical).
  // Visiting /contact redirects to /contact/.
  trailingSlash: true,

  images: {
    // Modern formats: smaller files, same quality.
    formats: ["image/avif", "image/webp"],
    // Next.js 16 requires the list of allowed image qualities.
    qualities: [75],

    /**
     * The image optimiser refuses SVGs by default and answers 400
     * ("image type is not allowed"), which showed every logo, treatment icon,
     * step icon and CTA frame on the site as a broken image.
     *
     * All the SVGs here are the client's own, copied from spabalimoon.com and
     * served from /public, so allowing them is safe — and the policy below
     * sandboxes them and blocks any script inside one.
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Old URLs → new URLs. The list lives in src/data/redirects.ts (see migration/url-map.md).
  async redirects() {
    return liveRedirects.map((redirect) => ({
      source: redirect.from,
      destination: redirect.to,
      permanent: true,
    }));
  },
};

export default nextConfig;
