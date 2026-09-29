// Run a live page module with a fake React runtime and dump its component tree.
//   node pagetree.mjs /seminyak/
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";

const url = process.argv[2] || "/seminyak/";
const file = `pages/${url.replace(/\//g, "_") || "_"}.html`;
const html = await readFile(file, "utf8");
const nextData = JSON.parse(html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const scripts = [...new Set([...html.matchAll(/\/_next\/static\/chunks\/([^"]+\.js)/g)].map((m) => m[1].split("/").pop()))];

// download missing chunks (also every chunk in js/ is loaded — harmless)
for (const s of scripts) {
  try { await readFile(`js/${s}`); } catch {
    const p = html.match(new RegExp(`/_next/static/chunks/[^"]*${s.replace(/\./g, "\\.")}`))[0];
    await writeFile(`js/${s}`, await (await fetch("https://spabalimoon.com" + p)).text());
  }
}
globalThis.self = globalThis;
self.webpackChunk_N_E = [];
globalThis.window = globalThis;
globalThis.document = { documentElement: {}, body: { classList: { add() {}, remove() {} } }, addEventListener() {}, removeEventListener() {} };
for (const f of await readdir("js")) {
  if (!f.endsWith(".js") || /^(framework|main|polyfills|webpack|_buildManifest|_ssgManifest)/.test(f)) continue;
  try { new Function(await readFile(`js/${f}`, "utf8"))(); } catch (e) { /* ignore runtime chunks */ }
}
const mods = {};
for (const entry of self.webpackChunk_N_E) Object.assign(mods, entry[1]);

const FRAG = Symbol("Fragment");
const tag = (fn, name) => { fn.__name = name; return fn; };
const fakeReact = {
  Fragment: FRAG,
  useState: (i) => [typeof i === "function" ? i() : i, () => {}],
  useEffect() {}, useLayoutEffect() {}, useRef: (v) => ({ current: v ?? null }),
  useMemo: (f) => f(), useCallback: (f) => f, useId: () => ":R0:", useContext: () => ({}),
  createContext: () => ({ Provider: tag(() => null, "Provider") }), forwardRef: (f) => tag(f, "forwardRef"),
  memo: (f) => f, Children: { toArray: (c) => [].concat(c || []) }, isValidElement: (x) => !!x?.__el,
  default: null,
};
fakeReact.default = fakeReact;
const el = (type, props, key) => ({ __el: true, type, props: props || {}, key });
const special = {
  85893: { jsx: el, jsxs: el, Fragment: FRAG },
  67294: fakeReact,
  41664: tag(() => null, "Link"),
  9008: tag(() => null, "Head"),
  40645: tag(() => null, "JSXStyle"),
  5152: () => tag(() => null, "Dynamic"),
  11163: { useRouter: () => ({ asPath: url, pathname: url, push() {}, query: {} }) },
  43079: { useRouter: () => ({ asPath: url, pathname: url, push() {}, query: {} }) },
  83454: { env: {} },
};
const cache = {};
function req(id) {
  id = String(id);
  if (special[id]) return special[id];
  if (cache[id]) return cache[id].exports;
  if (!mods[id]) return new Proxy(tag(() => null, "missing:" + id), { get: (t, k) => (k === "__name" ? "missing:" + id : tag(() => null, `missing:${id}.${String(k)}`)) });
  const module = { exports: {} };
  cache[id] = module;
  const r = (x) => req(x);
  r.d = (e, defs) => { for (const k in defs) Object.defineProperty(e, k, { get: defs[k], enumerable: true }); };
  r.r = () => {};
  r.n = (m) => { const g = () => (m && m.__esModule ? m.default : m); g.a = g(); return g; };
  r.e = () => Promise.resolve();
  r.bind = () => {};
  try { mods[id](module, module.exports, r); } catch (e) { const stub = tag(() => null, "lib:" + id); module.exports = new Proxy({ default: stub, Z: stub }, { get: (t, k) => (k in t ? t[k] : typeof k === "string" ? tag(() => null, `lib:${id}.${k}`) : undefined) }); }
  if (module.exports && (typeof module.exports === "object" || typeof module.exports === "function")) for (const k of Object.keys(module.exports)) {
    const v = module.exports[k];
    if (typeof v === "function" && !v.__name) v.__name = `${id}.${k}`;
  }
  if (typeof module.exports === "function" && !module.exports.__name) module.exports.__name = id;
  if (module.exports == null) module.exports = {};
  return module.exports;
}
const pageId = Object.keys(mods).find((k) => String(mods[k]).includes(`"${nextData.page}"`) && String(mods[k]).includes("__NEXT_P"));
const pageModId = String(mods[pageId]).match(/return \w+\((\d+)\)/)[1];
const page = req(pageModId).default;

// Render: expand page-level function components that are defined inside the
// page module (not exported elsewhere); keep imported components as leaves.
const pageFns = new Set();
function render(node, depth = 0) {
  if (node == null || node === false || node === true) return null;
  if (Array.isArray(node)) return node.map((n) => render(n, depth)).filter((x) => x !== null);
  if (typeof node !== "object" || !node.__el) return node;
  const { type, props } = node;
  const kids = props.children !== undefined ? render(props.children, depth + 1) : undefined;
  const rest = { ...props };
  delete rest.children;
  if (type === FRAG) return { frag: true, children: kids };
  if (typeof type === "string") return { tag: type, props: rest, children: kids };
  const name = type.__name || type.name || "anon";
  if (!type.__name && depth < 50) {
    // local component of the page module: expand
    pageFns.add(name);
    return { local: name, expanded: render(type(props), depth + 1) };
  }
  // serialise props (JSX inside props rendered too)
  const sp = {};
  for (const [k, v] of Object.entries(props)) sp[k] = ser(v);
  return { component: name, props: sp };
}
function ser(v) {
  if (v && typeof v === "object" && v.__el) return { jsx: render(v) };
  if (Array.isArray(v)) return v.map(ser);
  if (v && typeof v === "object") { const o = {}; for (const [k, x] of Object.entries(v)) o[k] = ser(x); return o; }
  if (typeof v === "function") return `[fn ${v.__name || v.name || ""}]`;
  return v;
}
const tree = render(page(nextData.props.pageProps));
await mkdir("trees", { recursive: true });
await writeFile(`trees/${url.replace(/\//g, "_") || "_"}.json`, JSON.stringify(tree, null, 1));
// summary
function sum(n, d = 0) {
  if (!n) return;
  if (Array.isArray(n)) return n.forEach((x) => sum(x, d));
  if (typeof n !== "object") return;
  if (n.jsx !== undefined && Object.keys(n).length === 1) return sum(n.jsx, d);
  const pad = "  ".repeat(d);
  if (n.component) { console.log(pad + "<" + n.component + "> " + Object.keys(n.props).filter((k) => k !== "children").join(",")); if (n.props.children) sum(n.props.children.jsx ?? n.props.children, d + 1); return; }
  if (n.local) { console.log(pad + "[local " + n.local + "]"); return sum(n.expanded, d + 1); }
  if (n.frag) return sum(n.children, d);
  if (n.tag) { if (d < 4) console.log(pad + n.tag + "." + (n.props.className || "")); sum(n.children, d + 1); }
}
sum(tree);
