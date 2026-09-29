// Compare <head> SEO tags (title, meta, canonical, icons, JSON-LD) of all 42 pages:
// live (pages/, from survey.mjs) vs local.   node headcmp.mjs [-v]
import { readFile } from "node:fs/promises";
const survey = JSON.parse(await readFile("pages/survey.json", "utf8"));
const pick = (html) => {
  const head = html.slice(0, html.indexOf("</head>"));
  const out = {};
  out.title = (head.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1];
  for (const m of head.matchAll(/<meta\s+([^>]+?)\/?>/g)) {
    const a = Object.fromEntries([...m[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
    const k = a.name || a.property || a.itemprop;
    if (k && a.content != null && !/viewport|next-size-adjust|generator|theme-color/.test(k)) out[k] = (out[k] ? out[k] + " | " : "") + a.content;
  }
  for (const m of head.matchAll(/<link\s+([^>]+?)\/?>/g)) {
    const a = Object.fromEntries([...m[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
    if (/canonical|icon|apple-touch-icon|manifest|alternate/.test(a.rel || "")) out["link:" + a.rel + (a.sizes ? ":" + a.sizes : "")] = a.href;
  }
  out.jsonld = [...head.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].length + [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].length;
  return out;
};
const dec = (s) => s?.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
let diffs = 0;
const keys = new Map();
for (const p of survey) {
  const live = pick(await readFile(`pages/${p.u.replace(/\//g, "_") || "_"}.html`, "utf8"));
  const local = pick(await (await fetch((process.env.LOCAL_URL || "http://localhost:3100") + p.u)).text());
  for (const k of new Set([...Object.keys(live), ...Object.keys(local)])) {
    const a = dec(String(live[k] ?? "∅")), b = dec(String(local[k] ?? "∅")).replace(/http:\/\/localhost:3100/g, "https://spabalimoon.com");
    if (a !== b) { diffs++; keys.set(k, (keys.get(k) || 0) + 1); if (process.argv.includes("-v") || keys.get(k) <= 2) console.log(p.u, k, "\n   live :", a.slice(0, 160), "\n   local:", b.slice(0, 160)); }
  }
}
console.log("diffs", diffs, [...keys].map(([k, n]) => `${k}×${n}`).join(" "));
