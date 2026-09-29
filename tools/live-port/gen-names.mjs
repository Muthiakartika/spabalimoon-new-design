// Rebuild the JSX hash → readable name table in names.mjs from pages/survey.json.
// Shared blocks are named in `named`; a block used by one page takes the page key.
import { readFile, writeFile } from "node:fs/promises";
import { pageKey } from "./names.mjs";
const sv = JSON.parse(await readFile("pages/survey.json", "utf8"));
const blocks = new Map();
for (const p of sv) for (const id of p.jsx) { if (!blocks.has(id)) blocks.set(id, []); blocks.get(id).push(pageKey(p.u)); }
const named = { fa73d67a1cbde21f: "header", "79a2f141362dbd93": "nav", b90dcc332ff485c4: "mobile-menu", fed456e651c2d4ae: "sidebar-bloom", "7203bab3b6644ec7": "about", "5a33fd3d20ab229e": "catalog", "60af60270c96dd97": "faq", "269698157d2b09af": "cta", "4c591e5d761e19b": "home", f633ad83bf1c1c0: "pricelist", "6016613d29cdec82": "package-tabs", "67a47d990120ff0f": "page-banner", c26d09e0f8da429a: "page-title", "85d8cb8e5fc9ac9": "guide-post", a43c30083df6d2b5: "treatment-layout", b7267c025d8a53f1: "outcall", f29b86dd6418af3a: "contact", "92feef8c692e18e8": "contact-form" };
const lines = [];
for (const [id, pages] of blocks) {
  const n = named[id] || (pages.length === 1 ? pages[0] : null);
  if (!n) { console.log("UNNAMED", id, pages.length); continue; }
  lines.push(`  "jsx-${id}": "jsx-${n}",`);
}
let s = (await readFile("names.mjs", "utf8")).replace(/\r\n/g, "\n");
// Keep names given by hand to blocks outside the server HTML (live/jsx-extra.json).
for (const m of s.matchAll(/^  "jsx-([0-9a-f]+)": "jsx-[\w-]+",$/gm)) if (!blocks.has(m[1])) lines.push(m[0]);
s = s.replace(/export const JSX = \{[\s\S]*?\n\};/, "export const JSX = {\n" + lines.join("\n") + "\n};");
await writeFile("names.mjs", s);
console.log(lines.length);
