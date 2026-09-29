"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import MainMenu from "@/components/layout/MainMenu";
import MobileMenu from "@/components/layout/MobileMenu";
import { SidebarBloom } from "@/components/ui/Frangipani";
import { LotusPaths } from "@/components/ui/Lotus";
import { business } from "@/data/business";
import { searchIndex } from "@/data/navigation";
import { whatsappChatUrl } from "@/lib/whatsapp";

type Sidebar = "closed" | "open" | "closing";

/**
 * Site header, search and off-canvas menu — the live "HeaderOne" component,
 * markup and behaviour included:
 *   - `menu-fixed` once the page has scrolled past 100px;
 *   - the search opens a dropdown, matches titles and keywords, Enter goes to
 *     the first result, Escape or a click outside closes it;
 *   - the sidebar slides out over 400ms ("closing") before it unmounts.
 * Every root element carries `lh` so src/styles/live.css applies.
 */
export default function Header() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sidebar, setSidebar] = useState<Sidebar>("closed");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const results = q ? searchIndex.filter((e) => e.title.toLowerCase().includes(q) || e.keywords.includes(q)) : [];

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };
  const closeSidebar = () => setSidebar("closing");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (sidebar !== "closing") return;
    const t = window.setTimeout(() => setSidebar("closed"), 400);
    return () => window.clearTimeout(t);
  }, [sidebar]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    const onDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) closeSearch();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [searchOpen]);

  return (
    <>
      <header className={`jsx-header header-area header-three-area ${scrolled ? "menu-fixed" : ""} lh`}>
        <div className="jsx-header header-one__wrp">
          <div className="jsx-header header__main">
            <Link prefetch={false} href="/" className="logo">
              {/* eslint-disable-next-line @next/next/no-img-element -- the live site's plain <img> */}
              <img src="/images/logo/SMBtitle.svg" alt="logo" width="444" height="80" className="jsx-header" />
            </Link>
            <div className="jsx-header main-menu">
              <nav className="jsx-header">
                <MainMenu />
              </nav>
            </div>
            <div className="jsx-header menu-btns">
              <div ref={searchRef} className="jsx-header header-search d-none d-lg-block">
                <button
                  onClick={() => setSearchOpen((v) => !v)}
                  aria-label="Search"
                  aria-expanded={searchOpen}
                  className="jsx-header search-trigger"
                >
                  <i className={`jsx-header fa-light ${searchOpen ? "fa-xmark" : "fa-magnifying-glass"}`} />
                </button>
                <div className={`jsx-header header-search__dropdown ${searchOpen ? "is-open" : ""}`}>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (results.length > 0) {
                        router.push(results[0].href);
                        closeSearch();
                      }
                    }}
                    className="jsx-header header-search__form"
                  >
                    <i className="jsx-header fa-light fa-magnifying-glass header-search__form-icon" />
                    <input
                      ref={inputRef}
                      type="search"
                      placeholder="Search treatments, pages..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="jsx-header header-search__input"
                    />
                  </form>
                  {q && (
                    <ul className="jsx-header header-search__results">
                      {results.length > 0 ? (
                        results.map((r) => (
                          <li key={r.href + r.title} className="jsx-header">
                            <Link prefetch={false} href={r.href} className="header-search__result" onClick={closeSearch}>
                              <i className="jsx-header fa-light fa-arrow-right-long" />
                              <span className="jsx-header">{r.title}</span>
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="jsx-header header-search__empty">No results for &ldquo;{query.trim()}&rdquo;</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
              <a
                href={whatsappChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="jsx-header book-now d-none d-xxl-inline-block"
              >
                Book an Appointment
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 25 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="jsx-header"
                >
                  <LotusPaths fill="currentColor" className="jsx-header" />
                </svg>
              </a>
              <a
                href={whatsappChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Spa Bali Moon on WhatsApp"
                className="jsx-header header-call d-flex d-lg-none"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="jsx-header"
                >
                  <path
                    d="M17.6 14.3l-2.4-.3c-.6-.1-1.1.1-1.5.5l-1.7 1.7a13.1 13.1 0 0 1-5.8-5.8l1.7-1.7c.4-.4.6-.9.5-1.5l-.3-2.4A1.5 1.5 0 0 0 6.6 3.5H5C4.1 3.5 3.4 4.2 3.5 5.1 4 12.1 9.9 18 16.9 18.5c.9.1 1.6-.6 1.6-1.5v-1.6c0-.8-.6-1.4-1.4-1.5z"
                    className="jsx-header"
                  />
                </svg>
              </a>
              <button
                onClick={() => setSidebar("open")}
                type="button"
                aria-controls="menubar"
                aria-expanded={sidebar === "open"}
                aria-label="Open menu"
                className="jsx-header menubars d-block d-lg-none"
              >
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="jsx-header">
                  <path
                    d="M8.55566 11H1.55566C1.29045 11 1.03609 11.1054 0.848557 11.2929C0.661021 11.4804 0.555664 11.7348 0.555664 12V19C0.555664 19.2652 0.661021 19.5196 0.848557 19.7071C1.03609 19.8946 1.29045 20 1.55566 20H8.55566C8.82088 20 9.07523 19.8946 9.26277 19.7071C9.45031 19.5196 9.55566 19.2652 9.55566 19V12C9.55566 11.7348 9.45031 11.4804 9.26277 11.2929C9.07523 11.1054 8.82088 11 8.55566 11ZM7.55566 18H2.55566V13H7.55566V18ZM19.5557 0H12.5557C12.2904 0 12.0361 0.105357 11.8486 0.292893C11.661 0.48043 11.5557 0.734784 11.5557 1V8C11.5557 8.26522 11.661 8.51957 11.8486 8.70711C12.0361 8.89464 12.2904 9 12.5557 9H19.5557C19.8209 9 20.0752 8.89464 20.2628 8.70711C20.4503 8.51957 20.5557 8.26522 20.5557 8V1C20.5557 0.734784 20.4503 0.48043 20.2628 0.292893C20.0752 0.105357 19.8209 0 19.5557 0ZM18.5557 7H13.5557V2H18.5557V7ZM19.5557 11H12.5557C12.2904 11 12.0361 11.1054 11.8486 11.2929C11.661 11.4804 11.5557 11.7348 11.5557 12V19C11.5557 19.2652 11.661 19.5196 11.8486 19.7071C12.0361 19.8946 12.2904 20 12.5557 20H19.5557C19.8209 20 20.0752 19.8946 20.2628 19.7071C20.4503 19.5196 20.5557 19.2652 20.5557 19V12C20.5557 11.7348 20.4503 11.4804 20.2628 11.2929C20.0752 11.1054 19.8209 11 19.5557 11ZM18.5557 18H13.5557V13H18.5557V18ZM8.55566 0H1.55566C1.29045 0 1.03609 0.105357 0.848557 0.292893C0.661021 0.48043 0.555664 0.734784 0.555664 1V8C0.555664 8.26522 0.661021 8.51957 0.848557 8.70711C1.03609 8.89464 1.29045 9 1.55566 9H8.55566C8.82088 9 9.07523 8.89464 9.26277 8.70711C9.45031 8.51957 9.55566 8.26522 9.55566 8V1C9.55566 0.734784 9.45031 0.48043 9.26277 0.292893C9.07523 0.105357 8.82088 0 8.55566 0ZM7.55566 7H2.55566V2H7.55566V7Z"
                    fill="#707070"
                    className="jsx-header"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {sidebar !== "closed" && (
        <div
          onClick={closeSidebar}
          aria-hidden="true"
          className={`jsx-header sidebar-backdrop${sidebar === "open" ? " is-visible" : ""} lh`}
        />
      )}
      <div
        id="menubar"
        aria-hidden={sidebar === "closed"}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === "transform" && sidebar === "closing") setSidebar("closed");
        }}
        style={{ backgroundColor: "#ffffff", borderLeft: "1px solid rgba(95, 90, 84, 0.12)" }}
        className={`jsx-header sidebar-area sidebar-area--white offcanvas offcanvas-end ${sidebar === "open" ? "show" : ""} ${
          sidebar === "closing" ? "hiding" : ""
        } lh`}
      >
        <div className="jsx-header offcanvas-header">
          <Link prefetch={false} href="/" className="logo">
            {/* eslint-disable-next-line @next/next/no-img-element -- the live site's plain <img> */}
            <img src="/images/logo/sbm.webp" alt="" aria-hidden="true" width="56" height="44" className="jsx-header" />
            <span className="jsx-header offcanvas-brand">{business.name}</span>
          </Link>
          <button type="button" onClick={closeSidebar} aria-label="Close menu" className="jsx-header btn-close">
            <i className="jsx-header fa-regular fa-xmark" />
          </button>
        </div>
        <div className="jsx-header offcanvas-body sidebar__body">
          <div className="jsx-header mobile-menu overflow-hidden">
            <MobileMenu />
          </div>
          <div className="jsx-header d-none d-lg-block">
            <p style={SIDEBAR_HEADING} className="jsx-header mb-20">
              About Us
            </p>
            <p style={{ color: "#5f5a54" }} className="jsx-header sidebar__text">
              Spa Bali Moon offers high-quality traditional massages and spa therapies, with outcall and home services
              by skilled therapists specializing in Balinese Body Massage.
            </p>
          </div>
          <div className="jsx-header sidebar__contact-info mt-30">
            <p style={SIDEBAR_HEADING} className="jsx-header mb-20">
              Contact Info
            </p>
            <ul className="jsx-header">
              <li className="jsx-header">
                <i style={{ color: "#A78627" }} className="jsx-header fa-solid fa-location-dot" />{" "}
                <Link prefetch={false} href="/#0" style={{ color: "#5f5a54" }}>
                  {business.address.short}
                </Link>
              </li>
              <li className="jsx-header py-2">
                <i style={{ color: "#A78627" }} className="jsx-header fa-solid fa-phone-volume" />{" "}
                <a
                  href={whatsappChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#5f5a54" }}
                  className="jsx-header"
                >
                  {business.phoneDisplay}
                </a>
              </li>
            </ul>
          </div>
          <SidebarBloom />
        </div>
      </div>
    </>
  );
}

const SIDEBAR_HEADING = {
  color: "#2f2924",
  fontFamily: "var(--title-font)",
  fontSize: "20px",
  fontWeight: 500,
  lineHeight: "30px",
} as const;
