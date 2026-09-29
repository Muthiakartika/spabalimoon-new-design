"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wrapper that lets the corner decorations of its sections drift up to 10px
 * with the scroll (`--decoration-scroll`), only while they are on screen —
 * the effect the live Balinese Massage page runs. Skipped for visitors who
 * ask for reduced motion.
 */
export default function DecorationMotion({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const shapes = [...root.querySelectorAll<HTMLElement>("section > .shape1, section > .shape2, .banner-two__shape")];
    const visible = new Set<HTMLElement>();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | undefined;
    const update = () => {
      frame = undefined;
      visible.forEach((el) => {
        const top = el.closest("section")?.getBoundingClientRect().top ?? 0;
        const offset = reduce.matches ? 0 : Math.max(-10, Math.min(10, -(0.025 * top)));
        el.style.setProperty("--decoration-scroll", `${offset}px`);
      });
    };
    const schedule = () => {
      if (frame === undefined) frame = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) visible.add(target as HTMLElement);
        else visible.delete(target as HTMLElement);
      });
      schedule();
    });
    shapes.forEach((el) => {
      el.dataset.decorationMotion = "true";
      io.observe(el);
    });
    window.addEventListener("scroll", schedule, { passive: true });
    reduce.addEventListener("change", schedule);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      reduce.removeEventListener("change", schedule);
      if (frame !== undefined) cancelAnimationFrame(frame);
      shapes.forEach((el) => {
        delete el.dataset.decorationMotion;
        el.style.removeProperty("--decoration-scroll");
      });
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
