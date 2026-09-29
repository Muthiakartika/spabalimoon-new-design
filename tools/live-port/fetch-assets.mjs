// Step 2: download every stylesheet and JS chunk the 42 live pages load
// (pages/*.html from survey.mjs) into live/css/ and js/.
import { readFile, writeFile, mkdir, readdir, access } from "node:fs/promises";
const exists = (p) => access(p).then(() => true, () => false);
await mkdir("live/css", { recursive: true });
await mkdir("js", { recursive: true });
const css = new Set();
const js = new Set();
for (const f of (await readdir("pages")).filter((f) => f.endsWith(".html"))) {
  const html = await readFile(`pages/${f}`, "utf8");
  for (const m of html.matchAll(/\/_next\/static\/css\/([0-9a-f]+)\.css/g)) css.add(m[1]);
  for (const m of html.matchAll(/\/_next\/static\/chunks\/[^"']+\.js/g)) js.add(m[0]);
}
// The build manifest lists the chunks of pages reached only by client navigation.
for (const p of [...js]) if (p.endsWith("_buildManifest.js")) {
  const man = await (await fetch("https://spabalimoon.com" + p)).text();
  for (const m of man.matchAll(/static\/chunks\/[^"']+\.js/g)) js.add("/_next/" + m[0]);
}
for (const f of css) {
  if (await exists(`live/css/${f}.css`)) continue;
  await writeFile(`live/css/${f}.css`, await (await fetch(`https://spabalimoon.com/_next/static/css/${f}.css`)).text());
}
for (const p of js) {
  const name = p.split("/").pop();
  if (await exists(`js/${name}`)) continue;
  await writeFile(`js/${name}`, await (await fetch("https://spabalimoon.com" + p)).text());
}
console.log(`stylesheets ${css.size}, chunks ${js.size}`);
