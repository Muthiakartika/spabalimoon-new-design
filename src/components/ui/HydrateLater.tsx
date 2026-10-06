import { Activity, type ReactNode } from "react";

/**
 * Lets React bring its children to life after the rest of the page, in small
 * steps (PageSpeed, 6 Oct). Without it, React wakes up the whole page in one
 * go: on the homepage that is one task of 270ms or more on a slow phone,
 * which PageSpeed counts as Total Blocking Time.
 *
 * A visible <Activity> is rendered in place in the HTML, and React hydrates
 * it at its lowest priority, in slices of about 5ms that leave the main
 * thread free in between. Nothing changes on screen. A click inside a section
 * that is not awake yet makes React wake that section first, then handle it.
 *
 * Not <Suspense>: React 19.2 moves a Suspense boundary of more than about
 * 12.8 KB of HTML to the end of the page and shows it later, in batches up to
 * 300ms apart, so the sections under the hero would appear late.
 */
export default function HydrateLater({ children }: { children: ReactNode }) {
  return <Activity mode="visible">{children}</Activity>;
}
