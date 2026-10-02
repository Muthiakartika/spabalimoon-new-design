import type { ReactNode } from "react";

/**
 * The default button text of AboutSplit and AboutSplitAlt: "Learn More". When
 * it leads to the Seminyak spa page, hidden words say so — search engines and
 * Lighthouse flag a bare "Learn More". Other links keep the bare words.
 */
export function learnMoreLabel(link: string): ReactNode {
  if (link.replace(/\/$/, "") !== "/seminyak") return "Learn More";
  return (
    <>
      Learn More<span className="sr-only"> about our Seminyak spa, prices and packages</span>
    </>
  );
}
