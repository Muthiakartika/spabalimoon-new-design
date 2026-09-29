// Build src/styles/live.css from the live site's ORIGINAL CSS, for every page.
//
// 1. Load the post-JS DOM of all 42 live pages (pages-dom/) into jsdom,
//    plus captured interactive states (live/extra-*.html).
// 2. Walk every rule of every live stylesheet — the CSS files and the
//    styled-jsx blocks — in cascade order. A rule is kept when one of its
//    selectors matches an element on a page that loads that stylesheet.
// 3. Scope each kept selector to `.lh` subtrees without changing specificity
//    (`:where(.lh,.lh *)` on the subject compound). A stylesheet that only some
//    pages load has its selectors also tied to those pages
//    (`:where(body:has(.p-<page>))`) whenever they would match elsewhere.
import { readFile, writeFile, readdir } from "node:fs/promises";
import postcss from "postcss";
import selParser from "postcss-selector-parser";
import { parseDocument } from "htmlparser2";
import { compile, selectOne, selectAll } from "css-select";
import { renameAll, pageKey, pageFile } from "./names.mjs";

const OUT = process.env.LIVE_CSS_OUT || "../../src/styles/live.css";
const survey = JSON.parse(await readFile("pages/survey.json", "utf8"));

// ---------- documents ----------
const preloader = `<div id="preloader"><div class="animation-preloader"><div class="preloader-mark"><img class="preloader-logo" src="/images/logo/sbm.webp"></div><div class="preloader-brand">Spa Bali Moon</div><p class="text-center">Loading...</p></div><div class="loader"><div class="row"><div class="col-3 loader-section section-left"><div class="bg"></div></div><div class="col-3 loader-section section-left"><div class="bg"></div></div><div class="col-3 loader-section section-right"><div class="bg"></div></div><div class="col-3 loader-section section-right"><div class="bg"></div></div></div></div></div>`;
const extraFiles = new Set(await readdir("live"));
const pages = [];
for (const p of survey) {
  const key = pageKey(p.u);
  let body = await readFile(`pages-dom/${pageFile(p.u)}.html`, "utf8");
  if (key === "home") {
    body += JSON.parse(await readFile("live/extra-blocks.json", "utf8")).join("");
    body += preloader + (await readFile("live/extra-manual.html", "utf8"));
  }
  if (extraFiles.has(`extra-${key}.html`)) body += await readFile(`live/extra-${key}.html`, "utf8");
  // Markup a component only renders after interaction (e.g. the guide sidebar's
  // search results): live/extra-jsx-<hash>.html joins every page with that block.
  for (const id of p.jsx) if (extraFiles.has(`extra-jsx-${id}.html`)) body += await readFile(`live/extra-jsx-${id}.html`, "utf8");
  // Text and SVG geometry never decide a match; dropping them keeps 42 DOMs in memory.
  body = body.replace(/ (d|points|srcset)="[^"]*"/g, "").replace(/>[^<]+</g, "><");
  const doc = parseDocument(`<!doctype html><html class="lenis"><head></head><body class="light-mode"><div id="__next">${body}</div></body></html>`);
  const ssr = await readFile(`pages/${pageFile(p.u)}.html`, "utf8");
  const jsx = [...ssr.matchAll(/<style id="__jsx-([0-9a-f]+)"[^>]*>([\s\S]*?)<\/style>/g)].map((m) => ({ id: m[1], css: m[2] }));
  pages.push({ url: p.u, key, doc, css: p.css, jsx, cache: new Map() });
}
console.log("pages", pages.length);

// ---------- sources in cascade order ----------
/** Merge per-page ordered lists into one order that respects each page's order. */
function mergeOrder(lists) {
  const order = [];
  for (const list of lists) {
    let at = 0;
    for (const item of list) {
      const i = order.indexOf(item);
      if (i === -1) order.splice(at++, 0, item);
      else at = Math.max(at, i + 1);
    }
  }
  return order;
}
const cssOrder = mergeOrder(pages.map((p) => p.css));
const jsxOrder = mergeOrder(pages.map((p) => p.jsx.map((j) => j.id)));
const sources = [];
for (const f of cssOrder) {
  let css;
  try { css = await readFile(`live/css/${f}.css`, "utf8"); } catch {
    css = await (await fetch(`https://spabalimoon.com/_next/static/css/${f}.css`)).text();
    await writeFile(`live/css/${f}.css`, css);
  }
  sources.push({ name: `${f}.css`, css, pages: pages.filter((p) => p.css.includes(f)) });
}
for (const id of jsxOrder) {
  const on = pages.filter((p) => p.jsx.some((j) => j.id === id));
  sources.push({ name: `__jsx-${id}`, css: on[0].jsx.find((j) => j.id === id).css, pages: on });
}
// styled-jsx blocks of components that only render after interaction (the
// contact page's toast and WhatsApp prompt) never reach the server HTML: take
// them from the bundles and keep every rule (they are scoped by their class).
const extraJsx = JSON.parse(await readFile("live/jsx-extra.json", "utf8"));
for (const [id, { css }] of Object.entries(extraJsx)) {
  sources.push({ name: `__jsx-${id}`, css, pages: pages.filter((p) => p.key === "contact"), keepAll: true });
}
console.log("sources", sources.map((s) => `${s.name}(${s.pages.length})`).join(" "));

// ---------- matching ----------
const STATE = [
  "active", "show", "showing", "collapsed", "collapsing", "open", "opened", "current", "menu-fixed",
  "fixed", "sticky", "animated", "animate__animated", "visible", "is-visible", "selected", "is-active",
  "in", "hover", "focus", "swiper-slide-active", "swiper-slide-next", "swiper-slide-prev",
  "swiper-slide-visible", "swiper-slide-fully-visible", "swiper-pagination-bullet-active",
  "swiper-pagination-bullet-active-main", "swiper-pagination-bullet-active-prev",
  "swiper-pagination-bullet-active-prev-prev", "swiper-pagination-bullet-active-next",
  "swiper-pagination-bullet-active-next-next",
  "swiper-button-disabled", "swiper-initialized", "swiper-horizontal", "swiper-backface-hidden",
  "swiper-pagination-bullets", "swiper-pagination-horizontal", "swiper-pagination-lock",
  "swiper-button-lock", "swiper-pagination-bullets-dynamic", "swiper-pagination-clickable",
  "mean-expand", "mean-clicked", "is-open", "expanded", "menu-open", "hiding", "is-sticky",
  "header-sticky", "slide-in", "is-expanded", "open-search", "search-active", "sidebar-open",
];
const stateRe = new RegExp("\\.(" + STATE.map((x) => x.replace(/-/g, "\\-")).join("|") + ")(?![\\w-])", "g");
const DYN = /::?(-webkit-[a-z-]+|-moz-[a-z-]+|-ms-[a-z-]+|before|after|placeholder|selection|marker|first-letter|first-line|hover|focus-visible|focus-within|focus|active|visited|link|target|checked|disabled|enabled|autofill|backdrop|file-selector-button|placeholder-shown|invalid|valid|required)(\([^)]*\))?(?![a-z-])/g;
const star = (s) => s.replace(/(^|[\s>+~(,])(?=[\s>+~),]|$)/g, "$1*");
const triesCache = new Map();
function tries(sel) {
  if (triesCache.has(sel)) return triesCache.get(sel);
  let s = sel.replace(DYN, "").replace(/:not\(\s*\)/g, "").trim();
  s = s.replace(/[>+~]\s*$/, "").trim() || "*";
  const t = [s];
  const s2 = s.replace(stateRe, "");
  if (s2 !== s) t.push(star(s2));
  const s3 = s.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, "");
  if (s3 !== s) t.push(s3);
  const s4 = s2.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, "");
  if (s4 !== s2) t.push(star(s4));
  triesCache.set(sel, t);
  return t;
}
const compiled = new Map();
function fn(t) {
  if (!compiled.has(t)) {
    let f = null;
    try { f = compile(t); } catch {}
    compiled.set(t, f);
  }
  return compiled.get(t);
}
function matchPage(p, sel) {
  if (p.cache.has(sel)) return p.cache.get(sel);
  let ok = false;
  for (const t of tries(sel)) {
    const f = fn(t);
    try { if (f && selectOne(f, p.doc)) { ok = true; break; } } catch {}
  }
  p.cache.set(sel, ok);
  return ok;
}
const matchAny = (list, sel) => list.some((p) => matchPage(p, sel));

// ---------- scoping ----------
const SCOPE = ":where(.lh,.lh *)";
const INHERITED = new Set([
  "font-family", "font-size", "font-weight", "line-height", "color", "text-align", "letter-spacing",
  "-webkit-font-smoothing", "-moz-osx-font-smoothing", "text-rendering", "font-style",
]);
const isPseudoEl = (n) => n.type === "pseudo" && (n.value.startsWith("::") || /^:(before|after|first-letter|first-line)$/i.test(n.value));

function scopeOne(t) {
  let out = null;
  selParser((root) => {
    let nodes = root.first.nodes.slice();
    const firstComb = nodes.findIndex((n) => n.type === "combinator");
    if (firstComb > 0) {
      const head = nodes.slice(0, firstComb);
      if ((head[0].type === "tag" && /^(html|body)$/i.test(head[0].value)) || (head.length === 1 && head[0].type === "pseudo" && head[0].value === ":root")) {
        nodes = nodes.slice(firstComb + 1);
      }
    }
    let lastComb = -1;
    nodes.forEach((n, i) => { if (n.type === "combinator") lastComb = i; });
    let at = nodes.length;
    for (let i = lastComb + 1; i < nodes.length; i++) if (isPseudoEl(nodes[i])) { at = i; break; }
    const str = (arr) => arr.map((n) => n.toString()).join("");
    out = (str(nodes.slice(0, at)).trimEnd() + SCOPE + str(nodes.slice(at)).replace(/^\s+/, "")).trim();
  }).processSync(t.trim());
  return out;
}
const pagePrefix = (list) => `:where(body:has(${list.map((p) => `.p-${p.key}`).join(",")})) `;

// ---------- walk ----------
const out = postcss.root();
const keyframes = [];
const usedAnims = new Set();
const noteAnims = (decl) => {
  if (!/^(-webkit-)?animation(-name)?$/.test(decl.prop)) return;
  for (const tok of decl.value.split(/[\s,]+/)) usedAnims.add(tok.replace(/["']/g, ""));
};
for (const p of pages) for (const el of selectAll("[style*=animation]", p.doc)) {
  const m = el.attribs.style.match(/animation(?:-name)?\s*:\s*([^;]+)/);
  if (m) m[1].split(/[\s,]+/).forEach((x) => usedAnims.add(x));
}
let kept = 0, total = 0, pageScoped = 0;
function walk(container, target, src) {
  const everywhere = src.pages.length === pages.length;
  const others = everywhere ? [] : pages.filter((p) => !src.pages.includes(p));
  const prefix = everywhere ? "" : pagePrefix(src.pages);
  container.each((node) => {
    if (node.type === "rule") {
      if (node.parent?.type === "atrule" && /keyframes/i.test(node.parent.name)) return;
      total++;
      const sels = selParser().astSync(node.selector).nodes.map((n) => n.toString().trim());
      const normal = [], raw = [];
      let root = false, body = false;
      for (const s of sels) {
        if (s === ":root") { root = true; continue; }
        if (/(^|[\s.])lenis/.test(s) || /^::-webkit-scrollbar/.test(s)) { raw.push(s); continue; }
        if (s === "body" || s === "html" || s === "html body") { if (matchAny(src.pages, "body")) body = true; continue; }
        if (!src.keepAll && !matchAny(src.pages, s)) continue;
        const scoped = scopeOne(s);
        if (!everywhere && !src.keepAll && matchAny(others, s)) { normal.push(prefix + scoped); pageScoped++; }
        else normal.push(scoped);
      }
      if (root) target.append(node.clone({ selector: everywhere ? ":where(.lh)" : `${prefix}:where(.lh)` }));
      if (body) {
        const c = node.clone({ selector: everywhere ? ":where(.lh)" : `${prefix}:where(.lh)` });
        c.walkDecls((d) => { if (!INHERITED.has(d.prop)) d.remove(); });
        if (c.nodes.length) target.append(c);
      }
      if (raw.length) target.append(node.clone({ selector: raw.join(",") }));
      if (normal.length) {
        kept++;
        const c = node.clone({ selector: normal.join(",") });
        c.walkDecls(noteAnims);
        target.append(c);
      }
    } else if (node.type === "atrule") {
      const n = node.name.toLowerCase();
      if (n === "media" || n === "supports" || n === "layer" || n === "container") {
        const wrapper = node.clone({ nodes: [] });
        walk(node, wrapper, src);
        if (wrapper.nodes.length) target.append(wrapper);
      } else if (/keyframes$/.test(n)) {
        keyframes.push(node.clone());
      } else if (n === "font-face" || n === "charset" || n === "import") {
        // fonts are declared by hand in the output
      } else {
        target.append(node.clone());
        console.warn("kept unknown at-rule", n);
      }
    }
  });
}
for (const src of sources) {
  const part = postcss.root();
  walk(postcss.parse(src.css), part, src);
  if (part.nodes.length) {
    out.append(postcss.comment({ text: ` ${renameAll(src.name)} ` }));
    out.append(part.nodes);
  }
  process.stdout.write(".");
}
console.log("");
// keyframes: keep the last definition of each used name, in first-seen order
const kfByName = new Map();
for (const k of keyframes) if (usedAnims.has(k.params.trim())) kfByName.set(k.params.trim(), k);
if (kfByName.size) {
  out.append(postcss.comment({ text: " keyframes " }));
  out.append([...kfByName.values()]);
}

let css = renameAll(out.toString());
// Live: the footer is the next sibling of the last section. Here the page sits
// inside <main>, so also accept a <main> whose page ends with such a section.
// The extra branch is inside :where(), so specificity is unchanged.
css = css.replaceAll(
  ".section__decoration-bottom+:is(.footer-area,.footer-two-area)",
  ":is(.section__decoration-bottom,:where(main:has(>.page-wrapper>.section__decoration-bottom:last-child)))+:is(.footer-area,.footer-two-area)"
);
// Same for the live rule on an element that ends with such a section (e.g.
// main.outcall-page): here that element is the page root's last child.
css = css.replaceAll(
  ":has(>.section__decoration-bottom:last-child)+:is(.footer-area,.footer-two-area)",
  ":is(:has(>.section__decoration-bottom:last-child),:where(main:has(>.page-wrapper>:last-child>.section__decoration-bottom:last-child)))+:is(.footer-area,.footer-two-area)"
);
// Next's CSS pipeline (Lightning CSS) keeps 6 significant digits: Bootstrap's
// 33.33333333% would be served as 33.3333%, and a third of 1434px would lay out
// at 477.98px instead of 478px. The same twelfths written through a var() cannot
// be folded, and Chrome lays them out exactly like the 8-decimal percentages
// (checked for every container width from 100 to 2600px in 0.25px steps).
const TWELFTHS = { "8.33333333%": 1, "16.66666667%": 2, "33.33333333%": 4, "41.66666667%": 5, "58.33333333%": 7, "66.66666667%": 8, "83.33333333%": 10, "91.66666667%": 11 };
css = css.replace(/\d+\.\d{7,}%/g, (m) => (TWELFTHS[m] ? `calc(${TWELFTHS[m] * 100}% / var(--lh-cols, 12))` : m));
// (colour channels are stored in 8 bits anyway, so rgba() alphas are safe)
const precise = [...new Set(css.replace(/url\([^)]*\)|rgba?\([^)]*\)/g, "").match(/\d*\.\d{6,}/g) || [])].filter((n) => n.replace(/^0*\.?0*/, "").replace(".", "").length > 6);
if (precise.length) console.warn("NUMBERS NEXT WILL ROUND", precise);
css = css
  .replace(/\/_next\/static\/media\/section-shape-top\.[0-9a-f]+\.png/g, "/images/shape/section-shape-top.png")
  .replace(/\/_next\/static\/media\/section-shape-bottom\.[0-9a-f]+\.png/g, "/images/shape/section-shape-bottom.png")
  .replace(/\/_next\/static\/media\/shape1\.[0-9a-f]+\.png/g, "/images/about/shape1.png")
  .replace(/\/_next\/static\/media\/([a-z-]*-mask(?:ing)?)\.[0-9a-f]+\.png/g, "/images/mask/$1.png");
const leftovers = [...new Set(css.match(/\/_next\/[^)"']+/g) || [])];
if (leftovers.length) console.warn("UNREWRITTEN URLS", leftovers);
await writeFile("live/scoped.css", css);
// ---------- pretty print ----------
const splitTop = (sel) => {
  const out = []; let d = 0, cur = "";
  for (const ch of sel) {
    if (ch === "(" || ch === "[") d++;
    if (ch === ")" || ch === "]") d--;
    if (ch === "," && d === 0) { out.push(cur.trim()); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};
function fmt(node, depth) {
  const pad = "  ".repeat(depth);
  if (node.type === "comment") return `\n${pad}/* ${node.text.trim()} */\n`;
  if (node.type === "decl") return `${pad}${node.prop}: ${node.value}${node.important ? " !important" : ""};\n`;
  const body = (node.nodes || []).map((n) => fmt(n, depth + 1)).join("");
  if (node.type === "rule") return `${pad}${splitTop(node.selector).join(`,\n${pad}`)} {\n${body}${pad}}\n`;
  if (node.type === "atrule") return `${pad}@${node.name} ${node.params} {\n${body}${pad}}\n`;
  return "";
}
const pretty = postcss.parse(css).nodes.map((n) => fmt(n, 0)).join("");

const HEADER = `/**
 * LIVE THEME — the styles spabalimoon.com actually uses, on every page.
 * GENERATED, do not hand-edit: regenerate from the live site instead
 * (tools/live-port/README.md).
 *
 * How it was made
 *   Every rule of the live stylesheets (${sources.length} sources — CSS files and
 *   styled-jsx blocks — ${total} rules) was tested against the DOM of all
 *   ${pages.length} live pages, including states JS toggles (open menus, search
 *   results, tabs, open accordions). The ${kept} rules that match anything are
 *   kept, in the original cascade order and with the original declarations.
 *
 * Scoping
 *   Each selector's subject gets \`:where(.lh,.lh *)\`, so a rule only applies
 *   inside an element carrying the \`lh\` class. \`:where()\` adds no
 *   specificity, so the cascade between these rules is exactly the live one,
 *   and the Bootstrap base rules (h1–h6, p, a, ul…) never reach the Tailwind
 *   pages. \`:root\` and \`body\` rules land on \`:where(.lh)\` itself.
 *
 *   A stylesheet only some pages load (a page's own styled-jsx) keeps that
 *   limit: its selectors that would also match on other pages get
 *   \`:where(body:has(.p-<page>))\` — every page root carries its \`p-<page>\`.
 *
 * Renamed, consistently in markup and CSS
 *   styled-jsx hashes      jsx-fa73d67a1cbde21f -> jsx-header (etc.)
 *   CSS-module classes     FrangipaniSpray_spray__KCYOL -> frangipani-spray__spray
 *
 * Two deliberate adjustments
 *   ::-webkit-scrollbar rules stay global — the live 8px scrollbar is page-wide.
 *   \`.section__decoration-bottom + footer\` (and \`:has(> that:last-child) + footer\`)
 *   also match when the page sits inside <main> — the live page has no <main>.
 */

/* Fonts — the live site's own self-hosted files, same unicode ranges. */
${fontFaces()}
/* Reset what the rebuild's body passes down but the live body does not set. */
:where(.lh) {
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}
`;

function fontFaces() {
  const LATIN_EXT = "u+0100-02ba,u+02bd-02c5,u+02c7-02cc,u+02ce-02d7,u+02dd-02ff,u+0304,u+0308,u+0329,u+1d00-1dbf,u+1e00-1e9f,u+1ef2-1eff,u+2020,u+20a0-20ab,u+20ad-20c0,u+2113,u+2c60-2c7f,u+a720-a7ff";
  const LATIN = "u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd";
  const ff = (family, style, weight, file, range) =>
    `@font-face {\n  font-family: ${family};\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: swap;\n  src: url(/webfonts/${file}.woff2) format("woff2");${range ? `\n  unicode-range: ${range};` : ""}\n}\n`;
  let s = "";
  s += ff("Literata", "normal", "200 900", "or3hQ6P12-iJxAIgLYT-JrUXnTPmvks", LATIN_EXT);
  s += ff("Literata", "normal", "200 900", "or3hQ6P12-iJxAIgLYTwJrUXnTPm", LATIN);
  s += ff("Mulish", "italic", "400", "1Ptwg83HX_SGhgqk2hAjQlW_mEuZ0FsSKeOfF5Q6DzVVwfak", LATIN_EXT);
  s += ff("Mulish", "italic", "400", "1Ptwg83HX_SGhgqk2hAjQlW_mEuZ0FsSKeOfGZQ6DzVVwQ", LATIN);
  for (const w of [300, 400, 500, 600, 700, 800, 900]) {
    s += ff("Mulish", "normal", String(w), "1Ptvg83HX_SGhgqk0QotYKNnBcif", LATIN_EXT);
    s += ff("Mulish", "normal", String(w), "1Ptvg83HX_SGhgqk3wotYKNnBQ", LATIN);
  }
  s += "\n/* Font Awesome — the live site's own subsets (46 glyphs each, 3–6 KB). */\n";
  s += ff('"Font Awesome 6 Brands"', "normal", "400", "fa-brands-400");
  s += ff('"Font Awesome 6 Pro"', "normal", "300", "fa-light-300");
  s += ff('"Font Awesome 6 Pro"', "normal", "400", "fa-regular-400");
  s += ff('"Font Awesome 6 Pro"', "normal", "900", "fa-solid-900");
  return s;
}

await writeFile(OUT, HEADER + pretty);
console.log("rules", total, "kept", kept, "page-scoped selectors", pageScoped, "bytes", (HEADER + pretty).length);
