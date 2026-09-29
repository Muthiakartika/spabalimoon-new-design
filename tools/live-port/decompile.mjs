// Turn a compiled React component module from the live bundle back into JSX.
//   node decompile.mjs <moduleId> [chunkFile]
// Output: decompiled/<moduleId>.jsx  (a draft to finish by hand)
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as t from "@babel/types";
import { renameAll } from "./names.mjs";
import prettier from "prettier";
const traverse = _traverse.default || _traverse;
const generate = _generate.default || _generate;

const id = process.argv[2];
let file = process.argv[3];
if (!file) {
  for (const f of await readdir("js")) {
    if (!f.endsWith(".js")) continue;
    const src = await readFile(`js/${f}`, "utf8");
    if (new RegExp(`[,{]${id}:function`).test(src) || (id === "48000" && src.includes("48e3:function"))) { file = f; break; }
  }
}
const src = await readFile(`js/${file}`, "utf8");
const ast = parse(src, { sourceType: "script" });

// find the module factory
let factory = null;
traverse(ast, {
  ObjectProperty(p) {
    const k = p.node.key;
    const name = t.isNumericLiteral(k) ? String(k.value) : t.isIdentifier(k) ? k.name : t.isStringLiteral(k) ? k.value : null;
    if ((name === id || (id === "48000" && name === "48000")) && t.isFunctionExpression(p.node.value)) { factory = p; p.stop(); }
  },
});
if (!factory) throw new Error("module not found in " + file);

// identify the jsx-runtime binding: var X = r(85893)
let jsxVar = null;
const imports = {};
factory.traverse({
  VariableDeclarator(p) {
    const init = p.node.init;
    if (t.isCallExpression(init) && init.arguments.length === 1 && t.isNumericLiteral(init.arguments[0]) && t.isIdentifier(p.node.id)) {
      imports[p.node.id.name] = init.arguments[0].value;
      if (init.arguments[0].value === 85893) jsxVar = p.node.id.name;
    }
  },
});

const isJsxCallee = (c) =>
  (t.isSequenceExpression(c) && c.expressions.length === 2 && t.isMemberExpression(c.expressions[1]) && t.isIdentifier(c.expressions[1].object, { name: jsxVar }) && /^jsxs?$/.test(c.expressions[1].property.name)) ||
  (t.isMemberExpression(c) && t.isIdentifier(c.object, { name: jsxVar }) && /^jsxs?$/.test(c.property.name));

function toName(node) {
  if (t.isStringLiteral(node)) return t.jsxIdentifier(node.value);
  if (t.isMemberExpression(node) && t.isIdentifier(node.object, { name: jsxVar }) && node.property.name === "Fragment") return null;
  if (t.isIdentifier(node)) return t.jsxIdentifier(node.name);
  if (t.isMemberExpression(node)) return t.jsxMemberExpression(t.isIdentifier(node.object) ? t.jsxIdentifier(node.object.name) : toName(node.object), t.jsxIdentifier(node.property.name));
  if (t.isCallExpression(node)) return t.jsxIdentifier("DYNAMIC_" + generate(node).code.replace(/\W+/g, "_"));
  return t.jsxIdentifier("UNKNOWN");
}
const attrName = (k) => {
  let n = t.isIdentifier(k) ? k.name : k.value;
  return n;
};
function childFrom(node) {
  if (t.isStringLiteral(node)) {
    const v = node.value;
    if (/^[^{}<>]*$/.test(v) && !/^\s|\s$/.test(v) && v.length) return t.jsxText(v.replace(/&/g, "&amp;"));
    return t.jsxExpressionContainer(node);
  }
  if (t.isJSXElement(node) || t.isJSXFragment(node)) return node;
  return t.jsxExpressionContainer(node);
}

factory.traverse({
  CallExpression: {
    exit(p) {
      const c = p.node.callee;
      // "a".concat(b, "c") -> template literal
      if (t.isMemberExpression(c) && t.isIdentifier(c.property, { name: "concat" }) && t.isStringLiteral(c.object)) {
        const esc = (v) => v.replace(/[`$\\]/g, (m) => "\\" + m);
        const quasis = [t.templateElement({ raw: esc(c.object.value) })];
        const exprs = [];
        for (const a of p.node.arguments) {
          if (t.isStringLiteral(a)) quasis[quasis.length - 1].value.raw += esc(a.value);
          else { exprs.push(a); quasis.push(t.templateElement({ raw: "" })); }
        }
        quasis[quasis.length - 1].tail = true;
        p.replaceWith(t.templateLiteral(quasis, exprs));
        return;
      }
      if (!isJsxCallee(p.node.callee)) return;
      const [type, props, key] = p.node.arguments;
      const name = toName(type);
      const attrs = [];
      let children = [];
      if (t.isObjectExpression(props)) {
        for (const pr of props.properties) {
          if (t.isSpreadElement(pr)) { attrs.push(t.jsxSpreadAttribute(pr.argument)); continue; }
          const k = attrName(pr.key);
          if (k === "children") {
            const v = pr.value;
            children = (t.isArrayExpression(v) ? v.elements : [v]).map(childFrom);
            continue;
          }
          let v = pr.value;
          if (t.isStringLiteral(v)) {
            if (k === "className") v = t.stringLiteral(renameAll(v.value));
            attrs.push(t.jsxAttribute(t.jsxIdentifier(k), v));
          } else if (t.isBooleanLiteral(v, { value: true }) || (t.isUnaryExpression(v, { operator: "!" }) && t.isNumericLiteral(v.argument, { value: 0 }))) {
            attrs.push(t.jsxAttribute(t.jsxIdentifier(k)));
          } else {
            if (t.isUnaryExpression(v, { operator: "!" }) && t.isNumericLiteral(v.argument, { value: 1 })) v = t.booleanLiteral(false);
            attrs.push(t.jsxAttribute(t.jsxIdentifier(k), t.jsxExpressionContainer(v)));
          }
        }
      } else if (props) attrs.push(t.jsxSpreadAttribute(props));
      if (key) attrs.push(t.jsxAttribute(t.jsxIdentifier("key"), t.jsxExpressionContainer(key)));
      const selfClose = children.length === 0;
      const el = name === null
        ? t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), children)
        : t.jsxElement(t.jsxOpeningElement(name, attrs, selfClose), selfClose ? null : t.jsxClosingElement(name), children, selfClose);
      p.replaceWith(el);
    },
  },
  // !0 / !1 literals
  UnaryExpression(p) {
    if (p.node.operator === "!" && t.isNumericLiteral(p.node.argument)) p.replaceWith(t.booleanLiteral(p.node.argument.value === 0));
  },
});

// rename destructured props: let { subTitle: t = x } = e  ->  bindings named after the prop
factory.traverse({
  VariableDeclarator(p) {
    if (!t.isObjectPattern(p.node.id)) return;
    for (const prop of p.node.id.properties) {
      if (!t.isObjectProperty(prop)) continue;
      const key = t.isIdentifier(prop.key) ? prop.key.name : prop.key.value;
      const val = prop.value;
      const local = t.isAssignmentPattern(val) ? val.left : val;
      if (t.isIdentifier(local) && local.name !== key && /^[a-zA-Z_$][\w$]*$/.test(key)) {
        try { p.scope.rename(local.name, key); } catch {}
      }
    }
  },
});

let code = generate(factory.node.value, { jsescOption: { minimal: true } }).code;
code = code.replace(/className: "jsx-[0-9a-f]+ " \+/g, (m) => renameAll(m));
code = renameAll(code);
const header = `// decompiled from live module ${id} (${file})\n// imports: ${JSON.stringify(imports)}\n`;
await mkdir("decompiled", { recursive: true });
let pretty = header + code;
try { pretty = await prettier.format("const __m = " + code, { parser: "babel", printWidth: 120 }); pretty = header + pretty; } catch (e) { console.warn("prettier failed", e.message.slice(0, 200)); }
await writeFile(`decompiled/${id}.jsx`, pretty);
console.log(`decompiled/${id}.jsx`, code.length);
