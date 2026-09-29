// Scope-aware rename of minified bindings in a TSX file, editing text in place
// (no reformatting). usage: node rename.mjs file old=new ...
// Declarations `let a = …, b = …` whose names are all renamed and never
// reassigned become `const`.
import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "@babel/parser";
import traverseMod from "@babel/traverse";
const traverse = traverseMod.default;
const [file, ...pairs] = process.argv.slice(2);
const map = Object.fromEntries(pairs.map((p) => p.split("=")));
const src = readFileSync(file, "utf8");
const ast = parse(src, { sourceType: "module", plugins: ["typescript", "jsx"] });
const edits = [];
const done = new Set();
traverse(ast, {
  Scope(path) {
    for (const [name, binding] of Object.entries(path.scope.bindings)) {
      if (!(name in map) || done.has(binding)) continue;
      done.add(binding);
      if (binding.constantViolations.length) throw new Error(`${name} is reassigned`);
      const ids = [binding.identifier, ...binding.referencePaths.map((r) => r.node)];
      for (const id of ids) {
        if (id.type !== "Identifier" && id.type !== "JSXIdentifier") throw new Error(`odd ref ${id.type}`);
        edits.push({ start: id.start, end: id.end, text: map[name] });
      }
      const decl = binding.path.parentPath;
      if (decl?.node.type === "VariableDeclaration" && decl.node.kind === "let") {
        const s = decl.node.start;
        if (!edits.some((e) => e.start === s)) edits.push({ start: s, end: s + 3, text: "const" });
      }
    }
  },
});
const missing = Object.keys(map).filter((n) => ![...done].some((b) => b.identifier.name === n));
if (missing.length) throw new Error("not found: " + missing);
edits.sort((a, b) => b.start - a.start);
let out = src;
for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
writeFileSync(file, out);
console.log(file, edits.length, "edits");
