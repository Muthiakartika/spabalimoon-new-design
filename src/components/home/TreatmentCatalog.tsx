"use client";

/* eslint-disable @next/next/no-img-element -- the live site serves these as plain <img> */
import Link from "next/link";
import { useMemo, useState } from "react";
import { home } from "@/data/pages/home";
import { catalog, catalogCategories, type CatalogCategory, type CatalogItem } from "@/data/pages/home-catalog";

/** The live site prints prices without the currency: "IDR 250K" -> "250K". */
const shortPrice = (price: string) => price.replace(/^IDR\s*/i, "");

/**
 * "Browse Our Spa Treatments" — the live treatment catalog: four category
 * tabs, cards sorted A–Z in two columns, one price panel open at a time.
 */
export default function TreatmentCatalog() {
  const { catalog: text } = home;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [category, setCategory] = useState<CatalogCategory>("massage");

  const items = useMemo(
    () =>
      catalog
        .filter((item) => (item.categories || [item.category]).includes(category))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [category]
  );
  const columns = useMemo(() => {
    const half = Math.ceil(items.length / 2);
    return [items.slice(0, half), items.slice(half)];
  }, [items]);

  return (
    <section className="jsx-catalog package-section treatment-catalog section__decoration-top section__decoration-bottom bg-sub pt-170 pb-170">
      <div data-wow-delay="200ms" data-wow-duration="1500ms" className="jsx-catalog shape1 wow slideInLeft">
        <img loading="lazy" decoding="async" src="/images/shape/banner-five-shape1.png" alt="" className="jsx-catalog sway_Y__animationY" />
      </div>
      <div className="jsx-catalog shape2">
        <img loading="lazy" decoding="async" src="/images/shape/package-shape-right.png" alt="" className="jsx-catalog sway__animation" />
      </div>
      <div className="jsx-catalog container">
        <div className="jsx-catalog section-header mb-60 center">
          <h4 data-wow-delay="00ms" data-wow-duration="1500ms" className="jsx-catalog sub-title wow fadeInUp">
            {text.subTitle}
          </h4>
          <h2 data-wow-delay="200ms" data-wow-duration="1500ms" className="jsx-catalog title wow fadeInUp">
            {text.title}
          </h2>
        </div>
        <div aria-label="Home service fee" className="jsx-catalog treatment-catalog__fee">
          <strong className="jsx-catalog">{text.fee.label}</strong>
          <span className="jsx-catalog">{text.fee.value}</span>
        </div>
        <div aria-label="Treatment categories" className="jsx-catalog treatment-catalog__categories">
          {catalogCategories.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setCategory(c.id);
                  setOpenKey(null);
                }}
                className={`jsx-catalog treatment-catalog__category${active ? " is-active" : ""}`}
              >
                <span className="jsx-catalog">{c.label}</span>
              </button>
            );
          })}
        </div>
        <div className="jsx-catalog row g-5 align-items-start">
          {columns.map((column, i) => (
            <div key={`column-${i}`} className="jsx-catalog col-lg-6 treatment-catalog__column">
              {column.map((item) => {
                const key = item.id || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                return (
                  <div key={key} className="jsx-catalog package-block">
                    <CatalogCard
                      item={item}
                      itemKey={key}
                      isOpen={openKey === key}
                      onToggle={() => setOpenKey((k) => (k === key ? null : key))}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CatalogCard({
  item,
  itemKey,
  isOpen,
  onToggle,
}: {
  item: CatalogItem;
  itemKey: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `treatment-pricing-${itemKey}`;
  // Cards that only lead to the contact page say "Book …" instead of "View … details".
  const label = item.href === "/contact/" ? `Book ${item.name}` : `View ${item.name} details`;
  // The last word is kept together with the arrow so it never wraps alone.
  const cut = label.lastIndexOf(" ");
  const head = cut === -1 ? "" : label.slice(0, cut + 1);
  const tail = cut === -1 ? label : label.slice(cut + 1);
  const photo = <img loading="lazy" decoding="async" src={item.image} alt={item.name} />;

  return (
    <article className={`treatment-catalog__item${isOpen ? " is-open" : ""}`}>
      {item.href ? (
        <Link prefetch={false} href={item.href} className="treatment-catalog__image" aria-label={`View ${item.name}`}>
          {photo}
        </Link>
      ) : (
        <div className="treatment-catalog__image">{photo}</div>
      )}
      <div className="treatment-catalog__content">
        <div className="treatment-catalog__heading">
          <h3 className="title">
            {item.href ? (
              <Link prefetch={false} href={item.href}>
                {item.name}
              </Link>
            ) : (
              item.name
            )}
          </h3>
          <button
            type="button"
            className="treatment-catalog__toggle"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={`${isOpen ? "Hide" : "Show"} pricing for ${item.name}`}
          >
            <i className="fa-solid fa-angle-down" aria-hidden="true" />
          </button>
        </div>
        <p className="treatment-catalog__description">{item.desc}</p>
        <div id={panelId} className="treatment-catalog__dropdown" aria-hidden={!isOpen}>
          <div className="treatment-catalog__dropdown-inner">
            {item.benefits?.length ? (
              <div className="treatment-catalog__benefits">
                <p className="treatment-catalog__benefits-title">Benefits:</p>
                <ul>
                  {item.benefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="treatment-catalog__prices">
              {item.options.map((o) => (
                <div key={`${o.label}-${o.price}`} className="treatment-catalog__option">
                  <div className="treatment-catalog__option-main">
                    <strong>{o.label}</strong>
                    <span>{shortPrice(o.price)}</span>
                  </div>
                  {o.details?.length ? (
                    <ul>
                      {o.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
            {item.href ? (
              <Link prefetch={false} href={item.href} className="treatment-catalog__details-link" tabIndex={isOpen ? undefined : -1}>
                {head}
                <span className="treatment-catalog__details-tail">
                  {tail}
                  <i className="fa-regular fa-arrow-right" aria-hidden="true" />
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
