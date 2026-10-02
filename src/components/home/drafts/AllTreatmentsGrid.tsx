"use client";

/* eslint-disable @next/next/no-img-element -- the live site serves these as plain <img> */
import Link from "next/link";
import { useState } from "react";
import { ArrowBox } from "@/components/home/icons";
import { allTreatments, type Treatment } from "@/components/home/treatments";
import { LotusIcon } from "@/components/ui/Lotus";

const FILTERS: { id: "all" | Treatment["group"]; label: string }[] = [
  { id: "all", label: "All" },
  { id: "massage", label: "Massage" },
  { id: "beauty", label: "Beauty" },
];

/** Tiles shown below 992px before "Show all". */
const FIRST = 6;

/**
 * Option 2 for "all treatments": every treatment page as a compact tile
 * (photo, icon, name, starting price) in a grid — six across on wide
 * screens — with the spa menu's pill tabs to filter Massage / Beauty. Below
 * 992px the first six show, and one button shows the rest.
 */
export default function AllTreatmentsGrid() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [expanded, setExpanded] = useState(false);
  const items = allTreatments.filter((t) => filter === "all" || t.group === filter);

  return (
    <section className="v2-popular v2-alltiles">
      <div className="container">
        <div className="section-header center">
          <h4 className="sub-title">
            <LotusIcon className="icon" />
            Our Treatments
          </h4>
          <h2 className="title">Find the Treatment for You</h2>
          <p>All 23 of our treatments, at our Seminyak spa or as home service.</p>
        </div>
        <div className="treatment-catalog__categories" aria-label="Treatment types">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => {
                setFilter(f.id);
                setExpanded(false);
              }}
              className={`treatment-catalog__category${filter === f.id ? " is-active" : ""}`}
            >
              <span>{f.label}</span>
            </button>
          ))}
        </div>
        <ul className={`v2-tiles${expanded ? " is-expanded" : ""}`}>
          {items.map((t, i) => (
            <li key={t.href} className={`v2-tile${i >= FIRST ? " is-extra" : ""}`}>
              <Link prefetch={false} href={t.href} className="v2-tile__link">
                <span className="v2-tile__media">
                  <img loading="lazy" decoding="async" src={t.image} alt="" />
                </span>
                <span className="v2-tile__body">
                  <span className="v2-tile__icon" aria-hidden="true">
                    <img loading="lazy" decoding="async" src={t.icon} alt="" />
                  </span>
                  <span className="v2-tile__name">{t.name}</span>
                  {t.price && <span className="v2-tile__price">{t.price}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {items.length > FIRST && !expanded && (
          <div className="v2-tiles__more">
            <button type="button" className="btn-two" onClick={() => setExpanded(true)}>
              Show All {items.length} Treatments
              <ArrowBox />
            </button>
          </div>
        )}
        <div className="v2-popular__more">
          <Link prefetch={false} href="/seminyak/" className="btn-two">
            View Price List
            <ArrowBox />
          </Link>
        </div>
      </div>
    </section>
  );
}
