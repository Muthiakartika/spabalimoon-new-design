"use client";

import { useEffect } from "react";

/**
 * Plays the reveal animation on anything carrying `data-reveal` once it
 * scrolls into view — the job WOW.js does on the live site, without shipping
 * WOW.js or animate.css.
 *
 * Mounted once in the root layout. Elements opt in with:
 *   <div data-reveal="fadeInUp" style={{ transitionDelay: "200ms" }} />
 *
 * The rule that matters: **content is never left invisible.** An earlier
 * version hid every `data-reveal` element up front and waited for an
 * IntersectionObserver callback; anything the observer missed stayed at
 * opacity 0 for good, which blanked out whole sections. So now:
 *
 *   - only elements that start BELOW the fold are hidden,
 *   - a scroll handler reveals them even if the observer never fires,
 *   - and a final timeout reveals whatever is still hidden.
 *
 * Any one of those three is enough to show the content.
 */
const REVEAL_ALL_AFTER_MS = 6000;

export default function ScrollReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;

    const reveal = (node: HTMLElement) => {
      node.dataset.revealIn = "1";
    };

    // With reduced motion, or without an observer, simply show everything.
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      nodes.forEach(reveal);
      return;
    }

    const pending = new Set<HTMLElement>();

    for (const node of nodes) {
      // Inside a closed tab panel: it has no box to intersect and scrolling
      // will not bring it into view, so show it and let the tab do the rest.
      if (node.closest("[hidden]")) {
        reveal(node);
        continue;
      }

      const box = node.getBoundingClientRect();
      // Visible now, or already scrolled past: show it straight away rather
      // than animating something the reader is looking at.
      if (box.top < window.innerHeight) {
        reveal(node);
        continue;
      }
      node.dataset.revealReady = "1";
      pending.add(node);
    }

    if (!pending.size) return;

    const done = (node: HTMLElement) => {
      reveal(node);
      pending.delete(node);
      observer.unobserve(node);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) done(entry.target as HTMLElement);
        }
      },
      // Start a little before the block reaches the fold, as WOW.js does.
      { rootMargin: "0px 0px -80px 0px", threshold: 0 }
    );

    pending.forEach((node) => observer.observe(node));

    // Safety net 1: plain scroll check, in case the observer misses anything
    // (elements inside a hidden tab panel, zero-height at observe time, …).
    const onScroll = () => {
      for (const node of Array.from(pending)) {
        if (node.getBoundingClientRect().top < window.innerHeight) done(node);
      }
      if (!pending.size) cleanup();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Safety net 2: never leave anything hidden for long.
    const timer = window.setTimeout(() => {
      Array.from(pending).forEach(done);
      cleanup();
    }, REVEAL_ALL_AFTER_MS);

    function cleanup() {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(timer);
    }

    return cleanup;
  }, []);

  return null;
}
