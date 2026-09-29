import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname } from "node:path";
const PUB = "../../public";
const paths = new Set();
for (const f of await readdir("pages-dom")) {
  const html = await readFile(`pages-dom/${f}`, "utf8");
  for (const m of html.matchAll(/(?:src|href|poster|data-src)="(\/(?:images|assets|videos?|media)[^"#?]+)"/g)) paths.add(m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) for (const part of m[1].split(",")) { const u = part.trim().split(/\s+/)[0]; if (u.startsWith("/images")) paths.add(u); }
  for (const m of html.matchAll(/url\((?:&quot;|["'])?(\/(?:images|assets)[^)"'&]+)/g)) paths.add(m[1]);
}
for (const f of await readdir("pages")) if (f.endsWith(".html")) {
  const html = await readFile(`pages/${f}`, "utf8");
  for (const m of html.matchAll(/url\((?:&quot;|["'])?(\/(?:images|assets)[^)"'&]+)/g)) paths.add(m[1]);
  for (const m of html.matchAll(/"(\/images\/[^"]+\.(?:webp|png|jpe?g|svg|gif|mp4))"/g)) paths.add(m[1]);
}
const css = await readFile(`${PUB}/../src/styles/live.css`, "utf8");
for (const m of css.matchAll(/url\(["']?(\/[^)"']+)["']?\)/g)) if (!m[1].startsWith("/webfonts")) paths.add(m[1]);
const sha = (b) => createHash("sha1").update(b).digest("hex");
let fixed = 0, same = 0, bad = [];
const list = [...paths].sort();
await Promise.all([0, 1, 2, 3, 4, 5].map(async (w) => {
  for (let i = w; i < list.length; i += 6) {
    const p = list[i];
    const res = await fetch("https://spabalimoon.com" + p);
    if (res.status !== 200) { bad.push(`${res.status} ${p}`); continue; }
    const live = Buffer.from(await res.arrayBuffer());
    const file = PUB + decodeURIComponent(p);
    let local = null;
    try { local = await readFile(file); } catch {}
    if (local && sha(local) === sha(live)) { same++; continue; }
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, live);
    fixed++;
    console.log(local ? "UPDATED" : "ADDED  ", p, live.length);
  }
}));
console.log("paths", list.length, "same", same, "written", fixed);
if (bad.length) console.log("not on live:\n  " + bad.join("\n  "));
