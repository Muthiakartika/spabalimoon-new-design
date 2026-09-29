"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type KeyboardEvent } from "react";
import { blogMenu, treatmentMenu } from "@/data/navigation";

type Submenu = "treatments" | "blog" | null;

/** Menu inside the off-canvas sidebar, with the live accordion submenus. */
export default function MobileMenu() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState<Submenu>(null);
  const toggle = (key: Submenu) => setOpen((current) => (current === key ? null : key));
  const onKey = (key: Submenu) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(key);
    }
  };

  const treatmentsOpen = open === "treatments";
  const blogOpen = open === "blog";

  return (
    <ul className="jsx-mobile-menu">
      <li className="jsx-mobile-menu">
        <Link prefetch={false} href="/">
          Home
        </Link>
      </li>
      <li className="jsx-mobile-menu">
        <Link prefetch={false} href="/seminyak/">
          Pricelist
        </Link>
      </li>
      <li className="jsx-mobile-menu">
        {/* Live resolves its "#0" against the current page. */}
        <Link prefetch={false} href={`${pathname}#0`}>
          Treatments
        </Link>
        <div aria-hidden={!treatmentsOpen} className={`jsx-mobile-menu mobile-submenu ${treatmentsOpen ? "is-open" : ""}`}>
          <ul className="jsx-mobile-menu sub-menu">
            {treatmentMenu.map((t) => (
              <li key={t.href} className="jsx-mobile-menu">
                <Link prefetch={false} href={t.href}>
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div
          onClick={() => toggle("treatments")}
          onKeyDown={onKey("treatments")}
          role="button"
          tabIndex={0}
          aria-label="Toggle treatments menu"
          aria-expanded={treatmentsOpen}
          className={`jsx-mobile-menu ${treatmentsOpen ? "dropdown-btn active" : "dropdown-btn"}`}
        >
          <i className="jsx-mobile-menu fa fa-angle-down" />
        </div>
      </li>
      <li className="jsx-mobile-menu">
        <Link prefetch={false} href="/outcall-home-service-massage/">
          Outcall
        </Link>
      </li>
      <li className="jsx-mobile-menu">
        <Link prefetch={false} href="/reservation/">
          Reservation
        </Link>
      </li>
      <li className="jsx-mobile-menu">
        <Link prefetch={false} href="/guide/">
          Blog
        </Link>
        <div aria-hidden={!blogOpen} className={`jsx-mobile-menu mobile-submenu ${blogOpen ? "is-open" : ""}`}>
          <ul className="jsx-mobile-menu sub-menu">
            {blogMenu.map((post) => (
              <li key={post.href} className="jsx-mobile-menu">
                <Link prefetch={false} href={post.href}>
                  {post.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div
          onClick={() => toggle("blog")}
          onKeyDown={onKey("blog")}
          role="button"
          tabIndex={0}
          aria-label="Toggle blog menu"
          aria-expanded={blogOpen}
          className={`jsx-mobile-menu ${blogOpen ? "dropdown-btn active" : "dropdown-btn"}`}
        >
          <i className="jsx-mobile-menu fa fa-angle-down" />
        </div>
      </li>
      <li className="jsx-mobile-menu">
        <Link prefetch={false} href="/contact/">
          Contact
        </Link>
      </li>
    </ul>
  );
}
