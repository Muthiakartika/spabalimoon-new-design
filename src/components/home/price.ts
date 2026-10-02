import type { CatalogOption } from "@/data/pages/home-catalog";

/** The live site prints prices without the currency: "IDR 250K" -> "250K". */
export const shortPrice = (price: string) => price.replace(/^IDR\s*/i, "");

/** "IDR 159K" -> 159, for comparing prices. */
export const thousands = (price: string) => Number(/([\d.]+)\s*K/i.exec(price)?.[1] ?? Number.POSITIVE_INFINITY);

/** Add-ons ("Additional Body Mask") are not what a treatment starts from. */
const isAddOn = (option: CatalogOption) => /^additional\b/i.test(option.label);

/** The option a treatment starts from: its cheapest, add-ons left out. */
export function startingOption(options: CatalogOption[]): CatalogOption {
  const priced = options.filter((o) => !isAddOn(o));
  return (priced.length ? priced : options).reduce((a, b) => (thousands(b.price) < thousands(a.price) ? b : a));
}

/**
 * Minutes of a plain duration option: "1 Hour" -> 60, "1.5 Hours · 2 pax" ->
 * 90, "30 Minutes" -> 30. Anything else ("1 Hour with Aloe Vera",
 * "Chocolate") -> null.
 */
export function durationOf(label: string): number | null {
  const m = /^(\d+(?:\.\d+)?)\s*(Hours?|Minutes?)(?:\s*·\s*2 pax)?$/i.exec(label.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return /^min/i.test(m[2]) ? n : n * 60;
}

/** 30 -> "30 Mins", 60 -> "1 Hr", 90 -> "1.5 Hrs": the package cards' units. */
export const durationLabel = (minutes: number) =>
  minutes < 60 ? `${minutes} Mins` : `${minutes / 60} ${minutes === 60 ? "Hr" : "Hrs"}`;
