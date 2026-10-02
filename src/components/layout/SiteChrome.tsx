"use client";

import { usePathname } from "next/navigation";

/**
 * The site-wide extras in the root layout (WhatsApp button, mobile action bar,
 * preloader, smooth scroll, reveal animations), left out of the blog admin
 * (/admin/), which is a back-office screen. On every other page this renders
 * its children unchanged.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return children;
}
