// Files under src/ not reachable from the app entry points (app/**, next.config).
// Run from the project root:  node tools/live-port/reach.mjs
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
const root = process.cwd();
const walk = (d) => readdirSync(d).flatMap((n) => { const p = path.join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const all = walk(path.join(root, "src")).filter((f) => /\.(tsx?|mjs|js|css)$/.test(f));
const resolve = (from, spec) => {
  let base;
  if (spec.startsWith("@/")) base = path.join(root, "src", spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const c of [base, base + ".ts", base + ".tsx", base + ".js", base + ".mjs", path.join(base, "index.ts"), path.join(base, "index.tsx")]) if (existsSync(c) && statSync(c).isFile()) return c;
  return null;
};
const entries = [...all.filter((f) => f.includes(path.join("src", "app") + path.sep)), ...["next.config.ts", "next.config.mjs", "src/middleware.ts", "src/proxy.ts"].map((f) => path.join(root, f)).filter(existsSync)];
const seen = new Set();
const stack = [...entries];
while (stack.length) {
  const f = stack.pop();
  if (seen.has(f)) continue;
  seen.add(f);
  const s = readFileSync(f, "utf8");
  for (const m of s.matchAll(/(?:from\s*|import\s*\(?\s*|@import\s+)["']([^"']+)["']/g)) {
    const r = resolve(f, m[1]);
    if (r) stack.push(r);
  }
}
for (const f of all) if (!seen.has(f)) console.log(path.relative(root, f));
