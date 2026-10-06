"use client";

import type Lenis from "lenis";
import { useEffect } from "react";

/**
 * Smooth wheel scrolling, as on the live site: Lenis with the live settings
 * (lerp 0.06, in-page anchors, inertia stopped on navigation). Skipped for
 * visitors who ask for reduced motion, and on phones and tablets (6 Oct,
 * PageSpeed): Lenis leaves touch scrolling to the browser, so there it only
 * cost a restyle of the whole page while the page was loading. In-page
 * anchors still scroll smoothly there through the CSS scroll-behavior.
 * Lenis is fetched only where it runs, so phones do not download it.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let lenis: Lenis | undefined;
    let cancelled = false;
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({
        autoRaf: true,
        smoothWheel: true,
        lerp: 0.06,
        anchors: true,
        stopInertiaOnNavigate: true,
      });
    });
    return () => {
      cancelled = true;
      lenis?.destroy();
    };
  }, []);
  return null;
}
