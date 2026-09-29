/**
 * Compares every page of the rebuild against the mirror of the live site.
 *
 *   node tools/compare-pages.mjs [rebuildOrigin] [mirrorOrigin]
 *
 * For each URL it reports the HTTP status on both sides, whether the <title>
 * matches, and how far the rendered text length is from the live page. It is a
 * coarse check — the DOM fingerprint in REBUILD-SPEC.md is the precise one —
 * but it catches missing pages, wrong titles and missing content fast.
 */
const REBUILD = process.argv[2] || "http://localhost:3100";
const MIRROR = process.argv[3] || "http://localhost:3200";

const treatments = [
  "anti-cellulite-massage", "balinese-massage", "body-scrub", "coconut-oil-massage",
  "couple-spa", "creambath", "day-spa", "deep-tissue-massage", "ear-wax-removal",
  "facial", "foot-massage", "foot-reflexology", "hair-braiding", "head-massage",
  "hot-stone-massage", "lymphatic-drainage-massage", "manicure-pedicure", "nail-spa",
  "shiatsu-massage", "sport-massage", "sunburn-massage", "thai-massage",
  "traditional-massage", "waxing-salon",
];

const guides = [
  "lymphatic-drainage-massage-benefits-techniques-what-to-expect",
  "what-is-a-balinese-massage",
  "what-is-thai-massage",
  "understanding-of-facial-massage",
  "understanding-slimming-massage",
  "best-massages-after-a-long-flight",
  "iv-drip",
];

const urls = [
  "/",
  "/contact/",
  "/reservation/",
  "/seminyak/",
  "/massage-kuta/",
  "/outcall-home-service-massage/",
  "/villa-hotel-massage/",
  "/wellness-in-bali/",
  "/privacy-policy/",
  "/terms-and-conditions/",
  "/guide/",
  ...guides.map((s) => `/guide/${s}/`),
  ...treatments.map((s) => `/seminyak/${s}/`),
];

const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

async function grab(origin, path) {
  try {
    const res = await fetch(origin + path, { redirect: "follow" });
    const html = await res.text();
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim() ?? "";
    return { status: res.status, title, len: strip(html).length };
  } catch (e) {
    return { status: 0, title: "", len: 0, error: String(e.message || e) };
  }
}

const rows = [];
for (const path of urls) {
  const [a, b] = await Promise.all([grab(REBUILD, path), grab(MIRROR, path)]);
  const titleOk = a.title === b.title;
  const drift = b.len ? ((a.len - b.len) / b.len) * 100 : 0;
  rows.push({ path, rebuild: a.status, live: b.status, titleOk, drift, aTitle: a.title, bTitle: b.title });
  process.stderr.write(".");
}
process.stderr.write("\n\n");

const bad = rows.filter((r) => r.rebuild !== 200 || r.live !== 200);
const titleMismatch = rows.filter((r) => r.rebuild === 200 && r.live === 200 && !r.titleOk);

console.log(`halaman diperiksa : ${rows.length}`);
console.log(`status 200 keduanya: ${rows.length - bad.length}`);
console.log(`judul cocok        : ${rows.filter((r) => r.titleOk).length}/${rows.length}`);
console.log("");

if (bad.length) {
  console.log("STATUS BERMASALAH:");
  for (const r of bad) console.log(`  ${r.path}  rebuild:${r.rebuild}  live:${r.live}`);
  console.log("");
}

if (titleMismatch.length) {
  console.log("JUDUL BERBEDA:");
  for (const r of titleMismatch) {
    console.log(`  ${r.path}`);
    console.log(`     baru : ${r.aTitle}`);
    console.log(`     live : ${r.bTitle}`);
  }
  console.log("");
}

console.log("SELISIH PANJANG TEKS (baru vs live):");
for (const r of rows.filter((x) => x.rebuild === 200 && x.live === 200).sort((x, y) => Math.abs(y.drift) - Math.abs(x.drift))) {
  const flag = Math.abs(r.drift) > 25 ? "  <-- perlu dicek" : "";
  console.log(`  ${r.drift >= 0 ? "+" : ""}${r.drift.toFixed(1).padStart(6)}%  ${r.path}${flag}`);
}
