// Find styled-jsx blocks in the live bundles that never appear in server HTML
// (components rendered only after interaction), with the chunks that hold them.
import { readFile, writeFile, readdir } from "node:fs/promises";
const survey = JSON.parse(await readFile("pages/survey.json", "utf8"));
const known = new Set(survey.flatMap((p) => p.jsx));
const found = new Map();
const re = /id:"([0-9a-f]{15,16})",children:("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;
for (const f of (await readdir("js")).filter((f) => f.endsWith(".js"))) {
  const s = await readFile(`js/${f}`, "utf8");
  for (const m of s.matchAll(re)) {
    let css;
    try { css = new Function(`return ${m[2]}`)(); } catch { continue; }
    if (!found.has(m[1])) found.set(m[1], { css, files: new Set() });
    found.get(m[1]).files.add(f);
  }
}
const missing = [...found].filter(([id]) => !known.has(id));
console.log("found", found.size, "missing from SSR", missing.length);
for (const [id, v] of missing) console.log(id, v.css.length, [...v.files].join(","));
await writeFile("live/jsx-extra.json", JSON.stringify(Object.fromEntries(missing.map(([id, v]) => [id, { css: v.css, files: [...v.files] }])), null, 1));
