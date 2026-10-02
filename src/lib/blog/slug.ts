import slugify from "slugify";

/** Any string to a URL-safe slug: "Manfaat Spa untuk Kulit" -> "manfaat-spa-untuk-kulit". */
export function makeSlug(value: string): string {
  return slugify(value || "", { lower: true, strict: true, trim: true });
}
