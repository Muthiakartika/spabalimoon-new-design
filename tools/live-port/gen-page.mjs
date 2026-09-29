// Generate a page component (TSX) from a live page tree (trees/<page>.json).
//   node gen-page.mjs /seminyak/thai-massage/ <outFile> <ComponentName>
import { readFile, writeFile } from "node:fs/promises";
import prettier from "prettier";
import { renameAll, pageKey, pageFile } from "./names.mjs";

const [url, outFile, Name] = process.argv.slice(2);
const tree = JSON.parse(await readFile(`trees/${pageFile(url)}.json`, "utf8"));
const key = pageKey(url);

const COMPONENTS = {
  "72345.Z": ["PageBanner", "@/components/sections/PageBanner"],
  "16933.Z": ["AboutIntro", "@/components/sections/AboutIntro"],
  "87239.Z": ["TreatmentPricing", "@/components/sections/TreatmentPricing"],
  "48125.Z": ["SessionOptions", "@/components/sections/SessionOptions"],
  "13757.Z": ["Funfacts", "@/components/sections/Funfacts"],
  "86800.Z": ["TreatmentTestimonials", "@/components/sections/TreatmentTestimonials"],
  "90195.Z": ["AboutSplit", "@/components/sections/AboutSplit"],
  "35801.Z": ["AboutSplitAlt", "@/components/sections/AboutSplitAlt"],
  "90541.Z": ["FaqSection", "@/components/sections/FaqSection"],
  "48000.Z": ["ServiceSlider", "@/components/sections/ServiceSlider"],
  "69246.Z": ["ReserveCta", "@/components/sections/ReserveCta"],
  "32507.Z": ["PackageTabs", "@/components/sections/PackageTabs"],
  "86286.Z": ["PackageIntro", "@/components/sections/PackageIntro"],
  "12314.Z": ["Testimonials", "@/components/sections/Testimonials"],
  "98902.Z": ["VideoSection", "@/components/sections/VideoSection"],
  "47398.Z": ["PageTitle", "@/components/sections/PageTitle"],
  "80252.Z": ["GuidePost", "@/components/sections/GuidePost"],
  "25670.Z": ["HomeServiceInfo", "@/components/sections/HomeServiceInfo"],
  "17983.Z": ["FloralDecoration", "@/components/ui/FloralDecoration"],
  Link: ["Link", "next/link"],
};
const used = new Set();
const WA = "https://wa.me/6287863175144";

/** internal page links get the trailing slash the rebuild uses */
const fixHref = (h) => {
  if (typeof h !== "string") return h;
  if (h === WA) return h;
  if (/^\/[^#?]*$/.test(h) && !/\.[a-z0-9]+$/i.test(h) && !h.endsWith("/")) return h + "/";
  const m = h.match(/^(\/[^#?]*?)([#?].*)$/);
  if (m && m[1] !== "/" && !m[1].endsWith("/") && !/\.[a-z0-9]+$/i.test(m[1])) return m[1] + "/" + m[2];
  return h;
};
const isJsxVal = (v) => v && typeof v === "object" && !Array.isArray(v) && "jsx" in v && Object.keys(v).length === 1;

function lit(v, ctxKey) {
  // JS literal for a prop value
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (typeof v === "string") return JSON.stringify(/href|link|Link$/i.test(ctxKey || "") ? fixHref(v) : v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (isJsxVal(v)) return jsx(v.jsx) || "null";
  if (Array.isArray(v)) return `[${v.map((x) => lit(x, ctxKey)).join(", ")}]`;
  if (typeof v === "object") {
    return `{ ${Object.entries(v).map(([k, x]) => `${/^[a-zA-Z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${lit(x, k)}`).join(", ")} }`;
  }
  return "undefined";
}
function attr(k, v) {
  if (k === "key" || k === "ref") return "";
  if (k === "className" && typeof v === "string") return `className=${JSON.stringify(renameAll(v))}`;
  if (typeof v === "string") {
    const val = /^(href)$/.test(k) ? fixHref(v) : v;
    return /["\\\n]/.test(val) ? `${k}={${JSON.stringify(val)}}` : `${k}="${val}"`;
  }
  if (v === true) return k.startsWith("data-") || k.startsWith("aria-") ? `${k}="true"` : k;
  return `${k}={${lit(v, k)}}`;
}
function text(s) {
  if (!s.length) return "";
  if (/[{}<>"'&]/.test(s) || /^\s|\s$/.test(s)) return `{${JSON.stringify(s)}}`;
  return s;
}
function jsx(n) {
  if (n == null || n === false) return "";
  if (typeof n === "string") return text(n);
  if (typeof n === "number") return String(n);
  if (Array.isArray(n)) return n.map(jsx).join("");
  if (isJsxVal(n)) return jsx(n.jsx);
  if (n.frag) return `<>${jsx(n.children)}</>`;
  if (n.local) return jsx(n.expanded);
  if (n.tag) {
    if (n.tag === "main") n = { ...n, tag: "div" }; // the rebuild layout already provides <main>
    const a = Object.entries(n.props).map(([k, v]) => attr(k, v)).filter(Boolean).join(" ");
    const kids = jsx(n.children);
    return kids ? `<${n.tag}${a ? " " + a : ""}>${kids}</${n.tag}>` : `<${n.tag}${a ? " " + a : ""} />`;
  }
  if (n.component) {
    if (n.component === "JSXStyle" || n.component === "Head") return "";
    const m = COMPONENTS[n.component];
    if (!m) return `{/* UNMAPPED ${n.component} */}`;
    used.add(n.component);
    const props = { ...n.props };
    const children = props.children;
    delete props.children;
    const a = Object.entries(props).map(([k, v]) => (isJsxVal(v) ? `${k}={${jsx(v.jsx) || "null"}}` : attr(k, v))).filter(Boolean).join(" ");
    const kids = children !== undefined ? jsx(children) : "";
    return kids ? `<${m[0]}${a ? " " + a : ""}>${kids}</${m[0]}>` : `<${m[0]}${a ? " " + a : ""} />`;
  }
  return "";
}

// root: Layout component -> its children
let root = tree;
function findLayout(n) {
  if (!n || typeof n !== "object") return null;
  if (Array.isArray(n)) { for (const x of n) { const f = findLayout(x); if (f) return f; } return null; }
  if (n.component === "95817.Z") return n;
  if (n.frag) return findLayout(n.children);
  if (n.local) return findLayout(n.expanded);
  return null;
}
const layout = findLayout(tree);
const body = layout ? layout.props.children : tree;
const inner = jsx(body);
const imports = [...used].map((c) => COMPONENTS[c]).filter((v, i, a) => a.findIndex((x) => x[0] === v[0]) === i)
  .map(([n, p]) => (p === "next/link" ? `import Link from "next/link";` : `import ${n} from "${p}";`));
const code = `${imports.join("\n")}

/** ${url} — generated from the live page's component tree, section for section. */
export default function ${Name}() {
  return (
    <div className="page-wrapper lh p-${key}">
      ${inner}
    </div>
  );
}
`;
let out = code;
try { out = await prettier.format(code, { parser: "typescript", printWidth: 120 }); } catch (e) { console.warn("prettier:", e.message.slice(0, 400)); }
await writeFile(outFile, out);
console.log(outFile, out.length, "components:", [...used].join(" "));
if (/UNMAPPED/.test(out)) console.log("UNMAPPED:", [...new Set(out.match(/UNMAPPED \S+/g))].join(" "));
