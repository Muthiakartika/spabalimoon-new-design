"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useNearViewport } from "@/lib/useNearViewport";

/**
 * A div with a background photo that is only fetched once the div comes near
 * the viewport. CSS backgrounds have no loading="lazy": a photo set inline is
 * downloaded as soon as the page is styled, even for a banner at the very
 * bottom. Until then the div paints `overlay` alone (the dark wash), which
 * nobody sees because it is still far below the fold.
 */
export default function LazyBackground({
  image,
  overlay,
  className,
  style,
  children,
}: {
  image: string;
  /** Background layers painted over the photo, e.g. a linear-gradient(). */
  overlay: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);

  return (
    <div ref={ref} className={className} style={{ ...style, backgroundImage: near ? `${overlay}, url(${image})` : overlay }}>
      {children}
    </div>
  );
}
