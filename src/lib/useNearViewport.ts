"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True once the element has come within `margin` of the viewport, and stays
 * true. The default is about what Chrome uses for loading="lazy" images, so
 * whatever waits for it is ready before the reader gets there.
 */
export function useNearViewport(ref: RefObject<Element | null>, margin = "1500px 0px") {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, margin]);

  return near;
}
