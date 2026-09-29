// JSX drafts for every top-level block of a live page (server markup).
//   node tojsx-page.mjs /seminyak/
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { renameAll, pageFile } from "./names.mjs";
const url = process.argv[2];
const html = await readFile(`pages/${pageFile(url)}.html`, "utf8");
const doc = new JSDOM(html).window.document;
const ATTR = { class: "className", for: "htmlFor", tabindex: "tabIndex", srcset: "srcSet", fetchpriority: "fetchPriority", crossorigin: "crossOrigin", autocomplete: "autoComplete", maxlength: "maxLength", readonly: "readOnly", colspan: "colSpan", rowspan: "rowSpan", enctype: "encType", novalidate: "noValidate", datetime: "dateTime", referrerpolicy: "referrerPolicy", spellcheck: "spellCheck", inputmode: "inputMode", "xlink:href": "xlinkHref", "xml:space": "xmlSpace", "xmlns:xlink": "xmlnsXlink", allowfullscreen: "allowFullScreen", frameborder: "frameBorder" };
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const BOOL = new Set(["hidden", "disabled", "required", "checked", "selected", "multiple", "autofocus", "novalidate", "open", "async", "defer", "readonly", "allowfullscreen"]);
const VOID = new Set(["img", "br", "hr", "input", "meta", "link", "source", "wbr", "area", "col", "embed", "track"]);
function styleObj(s) {
  return "{{ " + s.split(";").map((x) => x.trim()).filter(Boolean).map((p) => {
    const i = p.indexOf(":"); let k = p.slice(0, i).trim(); const v = p.slice(i + 1).trim();
    if (k.startsWith("--")) return `${JSON.stringify(k)}: ${JSON.stringify(v)}`;
    k = k.startsWith("-") ? camel(k.slice(1)).replace(/^./, (c) => c.toUpperCase()) : camel(k);
    return `${k}: ${JSON.stringify(v)}`;
  }).join(", ") + " }}";
}
function textOut(t) {
  if (!t.length) return "";
  if (/^\s+$/.test(t)) return `{${JSON.stringify(t.replace(/\s+/g, " "))}}`;
  if (/[{}<>]/.test(t) || /^\s|\s$/.test(t)) return `{${JSON.stringify(t)}}`;
  return t.replace(/&/g, "&amp;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
}
function el2jsx(node, depth) {
  const pad = "  ".repeat(depth);
  if (node.nodeType === 3) { const t = textOut(node.nodeValue); return t ? pad + t + "\n" : ""; }
  if (node.nodeType !== 1) return "";
  const tag = node.namespaceURI === "http://www.w3.org/2000/svg" ? node.tagName : node.localName;
  const attrs = [];
  for (const a of node.attributes) {
    let name = a.name, val = a.value;
    if (name === "class") val = renameAll(val).trim().replace(/\s+/g, " ");
    if (name === "style") { attrs.push(`style=${styleObj(val)}`); continue; }
    if (ATTR[name]) name = ATTR[name]; else if (!/^(aria|data)-/.test(name) && name.includes("-")) name = camel(name);
    if (BOOL.has(a.name) && (val === "" || val === a.name)) { attrs.push(name); continue; }
    if (tag === "input" && name === "value") name = "defaultValue";
    attrs.push(`${name}=${JSON.stringify(val)}`);
  }
  const open = `<${tag}${attrs.length ? " " + attrs.join(" ") : ""}`;
  const kids = [...node.childNodes];
  if (!kids.length || VOID.has(tag)) return `${pad}${open} />\n`;
  if (kids.length === 1 && kids[0].nodeType === 3 && kids[0].nodeValue.length < 80) return `${pad}${open}>${textOut(kids[0].nodeValue)}</${tag}>\n`;
  return `${pad}${open}>\n${kids.map((k) => el2jsx(k, depth + 1)).join("")}${pad}</${tag}>\n`;
}
const dir = `drafts/${pageFile(url)}`;
await mkdir(dir, { recursive: true });
const wrapper = doc.querySelector(".page-wrapper");
let i = 0;
for (const c of wrapper.children) {
  const cls = (c.getAttribute("class") || c.tagName).replace(/jsx-[0-9a-f]+/g, "").trim().split(/\s+/)[0];
  await writeFile(`${dir}/${String(i++).padStart(2, "0")}-${cls}.tsx`, el2jsx(c, 2));
}
console.log(dir, i);
