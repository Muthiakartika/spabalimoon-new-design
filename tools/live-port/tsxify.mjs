// Turn a cleaned decompiled module into a TSX component file.
//   node tsxify.mjs <moduleId> <ComponentName> <outFile> [exportFnName]
import { readFile, writeFile } from "node:fs/promises";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as t from "@babel/types";
import prettier from "prettier";
const traverse = _traverse.default || _traverse;
const generate = _generate.default || _generate;

const [id, Name, outFile, fnArg] = process.argv.slice(2);
const src = await readFile(`decompiled/${id}.clean.jsx`, "utf8");
const ast = parse(src.replace(/^\/\/.*\n/gm, ""), { sourceType: "module", plugins: ["jsx"] });
const fn = ast.program.body[0].declarations[0].init; // const __m = function(e,t,i){...}
const req = fn.params[2]?.name || fn.params[1]?.name;

// module-local imports: var x = req(N)
const mods = {};
const body = [];
let exportName = fnArg;
for (const st of fn.body.body) {
  if (t.isExpressionStatement(st) && t.isStringLiteral(st.expression)) continue; // "use strict"
  if (t.isExpressionStatement(st) && t.isCallExpression(st.expression)) {
    const c = st.expression.callee;
    if (t.isMemberExpression(c) && t.isIdentifier(c.object, { name: req }) && ["d", "r"].includes(c.property.name)) {
      if (c.property.name === "d" && !exportName) {
        const obj = st.expression.arguments[1];
        const z = obj.properties.find((p) => ["Z", "default", "ZP"].includes(p.key.name || p.key.value)) || obj.properties[0];
        exportName = z.value.body.body[0].argument.name;
      }
      continue;
    }
    if (t.isIdentifier(c, { name: req })) continue; // bare require for side effects
    if (t.isSequenceExpression(st.expression)) { /* e.g. s(64172), s(57638) */ }
  }
  if (t.isExpressionStatement(st) && t.isSequenceExpression(st.expression) && st.expression.expressions.every((e) => t.isCallExpression(e) && t.isIdentifier(e.callee, { name: req }))) continue;
  if (t.isVariableDeclaration(st)) {
    const keep = [];
    for (const d of st.declarations) {
      const init = d.init;
      if (t.isCallExpression(init) && t.isIdentifier(init.callee, { name: req }) && t.isNumericLiteral(init.arguments[0])) { mods[d.id.name] = init.arguments[0].value; continue; }
      if (t.isCallExpression(init) && t.isMemberExpression(init.callee) && t.isIdentifier(init.callee.object, { name: req }) && init.callee.property.name === "n") { mods[d.id.name] = mods[init.arguments[0].name]; continue; }
      keep.push(d);
    }
    if (keep.length) body.push(t.variableDeclaration(st.kind, keep));
    continue;
  }
  body.push(st);
}

// ---- type inference from default values ----
const consts = {};
for (const st of body) if (t.isVariableDeclaration(st)) for (const d of st.declarations) if (t.isIdentifier(d.id)) consts[d.id.name] = d.init;
function typeOf(node, depth = 0) {
  if (!node || depth > 6) return "unknown";
  if (t.isStringLiteral(node) || t.isTemplateLiteral(node)) return "string";
  if (t.isNumericLiteral(node)) return "number";
  if (t.isBooleanLiteral(node)) return "boolean";
  if (t.isJSXElement(node) || t.isJSXFragment(node)) return "ReactNode";
  if (t.isArrayExpression(node)) return node.elements.length ? `${wrap(typeOf(node.elements[0], depth + 1))}[]` : "string[]";
  if (t.isObjectExpression(node)) return `{ ${node.properties.filter((p) => t.isObjectProperty(p)).map((p) => `${p.key.name || JSON.stringify(p.key.value)}${""}: ${typeOf(p.value, depth + 1)}`).join("; ")} }`;
  if (t.isIdentifier(node) && consts[node.name]) return typeOf(consts[node.name], depth + 1);
  return "unknown";
}
const wrap = (s) => (/[|&]/.test(s) ? `(${s})` : s);
function guess(name) {
  if (/children|Content|Decoration|title$/i.test(name) && !/Src$/.test(name)) return "ReactNode";
  if (/^(show|remove|large|paper|embedded|plain|standard)/.test(name)) return "boolean";
  if (/Spacing$/.test(name)) return "number";
  if (/Src$|Image$|image$|Link$|Text$|text$|Title$|subTitle|label|icon/i.test(name)) return "string | null";
  return "unknown";
}

// ---- rewrite ----
const imports = new Set();
const out = t.program(body);
traverse(t.file(out), {
  // (0, x.y)(args)  or  x.y  for known modules
  MemberExpression(p) {
    const o = p.node.object;
    if (!t.isIdentifier(o) || !(o.name in mods)) return;
    const mod = mods[o.name], k = p.node.property.name;
    const map = {
      50557: { T: ["stripIdr", `import { stripIdr } from "@/lib/price";`] },
      16677: { LQ: ["leftLeafShape", `import { leftLeafShape, rightLeafShape, isLeafShape } from "@/lib/leafShapes";`], mR: ["rightLeafShape", null], dd: ["isLeafShape", null] },
      17983: { Z: ["FloralDecoration", `import FloralDecoration from "@/components/ui/FloralDecoration";`] },
      3864: { Db: ["SidebarBloom", `import { SidebarBloom } from "@/components/ui/Frangipani";`] },
      43834: { n: ["testimonials", `import { testimonials } from "@/data/testimonials";`] },
      30584: { P: ["catalog", `import { catalog } from "@/data/pages/home-catalog";`] },
      93647: { y: ["treatmentMenu", `import { treatmentMenu } from "@/data/navigation";`] },
      11163: { useRouter: ["useRouter", `import { useRouter } from "next/navigation";`] },
      5700: { Z: ["ReviewText", `import ReviewText from "@/components/ui/ReviewText";`] },
    };
    if (mod === 67294 && /^use[A-Z]/.test(k)) { p.replaceWith(t.identifier(k)); return; }
    const m = map[mod]?.[k];
    if (m) {
      if (m[1]) imports.add(m[1]);
      if (mod === 16677) imports.add(map[16677].LQ[1]);
      p.replaceWith(t.identifier(m[0]));
    } else {
      p.replaceWith(t.identifier(`MOD_${mod}_${k}`));
    }
  },
  CallExpression(p) {
    // (0, x)(...) with x already replaced
    const c = p.node.callee;
    if (t.isSequenceExpression(c) && c.expressions.length === 2 && t.isNumericLiteral(c.expressions[0])) p.node.callee = c.expressions[1];
  },
});
let code = generate(out, { jsescOption: { minimal: true } }).code;
// the standard gold lotus -> <LotusIcon>
code = code.replace(/<svg\s+className="([^"]*?)"\s+width="25"\s+height="26"\s+viewBox="0 0 25 26"\s+fill="none"\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg">\s*<g clipPath="url\(#(clip0_1_475|clip0_intro)\)"(?: className="[^"]*")?>(?:\s*<path[^>]*fill="#A78627"[^>]*\/>){6}\s*<\/g>\s*<\/svg>/g, (m, cls, clip) => {
  const scope = (cls.match(/jsx-[\w-]+/) || [])[0];
  const rest = cls.replace(/jsx-[\w-]+/, "").trim();
  imports.add(`import { LotusIcon } from "@/components/ui/Lotus";`);
  return `<LotusIcon className="${rest}"${scope ? ` scope="${scope}"` : ""}${clip === "clip0_intro" ? ` clip="clip0_intro"` : ""} />`;
});

// hooks
if (/\buse(State|Effect|Ref|Memo|Callback|Id|LayoutEffect)\b/.test(code)) {
  const hooks = [...new Set(code.match(/\buse(State|Effect|Ref|Memo|Callback|Id|LayoutEffect)\b/g))].sort();
  imports.add(`import { ${hooks.join(", ")} } from "react";`);
}
if (/<Link\b/.test(code)) imports.add(`import Link from "next/link";`);
if (/<Swiper\b/.test(code)) imports.add(`import { Swiper, SwiperSlide } from "swiper/react";`);
const mods2 = ["Autoplay", "Navigation", "Pagination"].filter((m) => new RegExp(`\\b${m}\\b`).test(code));
if (mods2.length) imports.add(`import { ${mods2.join(", ")} } from "swiper/modules";`);
const client = /\buse(State|Effect|Ref|Memo|Callback|LayoutEffect)\b|<Swiper\b|onClick=/.test(code);

// props: rewrite `function X(e) { let { a = 1, b: b } = e, rest...;`
const typeLines = [];
code = code.replace(new RegExp(`function ${exportName}\\((\\w+)\\) \\{\\s*let \\{([\\s\\S]*?)\\}\\s*=\\s*\\1(,|;)`), (m, param, props, sep) => {
  // parse props with babel to infer types
  const pAst = parse(`let {${props}} = x;`, { sourceType: "module", plugins: ["jsx"] });
  const pat = pAst.program.body[0].declarations[0].id;
  const parts = [];
  for (const pr of pat.properties) {
    const key = pr.key.name || pr.key.value;
    let def = null, local = pr.value;
    if (t.isAssignmentPattern(pr.value)) { def = pr.value.right; local = pr.value.left; }
    const ty = def ? typeOf(def) : guess(key);
    typeLines.push(`  ${key}?: ${ty === "unknown" ? guess(key) : ty};`);
    const localName = local.name;
    parts.push(`${key === localName ? key : `${key}: ${localName}`}${def ? ` = ${generate(def).code}` : ""}`);
  }
  return `export default function ${Name}({\n  ${parts.join(",\n  ")}\n}: ${Name}Props) {\n  let ${sep === "," ? "" : "__unused = 0"}`;
});
code = code.replace(/let __unused = 0;?/, "");
code = code.replace(/let\s*\n\s*(\w)/, "let $1"); // tidy
if (/ReactNode/.test(typeLines.join(""))) imports.add(`import type { ReactNode } from "react";`);
const header = `${client ? `"use client";\n\n` : ""}/* eslint-disable @next/next/no-img-element -- the live site serves these as plain <img> */\n${[...imports].join("\n")}\n\nexport type ${Name}Props = {\n${typeLines.join("\n")}\n};\n\n`;
let file = header + code;
try { file = await prettier.format(file, { parser: "typescript", printWidth: 120 }); } catch (e) { console.warn("prettier:", e.message.slice(0, 300)); }
await writeFile(outFile, file);
console.log(outFile, "export", exportName, "mods", JSON.stringify(mods), "client", client);
if (/MOD_\d+/.test(file)) console.log("UNMAPPED:", [...new Set(file.match(/MOD_\d+_\w+/g))].join(" "));
