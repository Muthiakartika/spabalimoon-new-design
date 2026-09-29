"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Smooth wheel scrolling, as on the live site: Lenis with the live settings
 * (lerp 0.06, in-page anchors, inertia stopped on navigation). Skipped for
 * visitors who ask for reduced motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      lerp: 0.06,
      anchors: true,
      stopInertiaOnNavigate: true,
    });
    return () => lenis.destroy();
  }, []);
  return null;
}
