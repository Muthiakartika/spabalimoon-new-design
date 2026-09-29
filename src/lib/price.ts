/** "IDR 250K" -> "250K" — the live price lists print prices without the currency. */
export function stripIdr<T>(price: T): T {
  return (typeof price === "string" ? price.replace(/^IDR\s*/i, "") : price) as T;
}
