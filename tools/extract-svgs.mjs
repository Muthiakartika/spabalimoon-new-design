/**
 * Pulls the inline SVGs out of the mirrored live HTML and writes them as
 * .svg files, so the rebuild can reuse the original artwork exactly instead
 * of anyone redrawing it.
 *
 *   node tools/extract-svgs.mjs [pathToMirrorHtml] [outDir]
 *
 * Defaults to the homepage of the mirror in ../new-spa/site.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";

const HTML = resolve(
  process.argv[2] || "D:/Next.js Data/new-spa/site/index.html"
);
const OUT = resolve(process.argv[3] || "public/icons");

const html = await readFile(HTML, "utf8");

/** Scan for <svg …>…</svg>, honouring nesting. */
function findSvgs(src) {
  const out = [];
  const open = /<svg\b/gi;
  let m;
  while ((m = open.exec(src))) {
    let depth = 0;
    let i = m.index;
    const tag = /<\/?svg\b[^>]*>/gi;
    tag.lastIndex = i;
    let t;
    while ((t = tag.exec(src))) {
      if (t[0][1] === "/") depth--;
      else depth++;
      if (depth === 0) {
        out.push(src.slice(i, t.index + t[0].length));
        open.lastIndex = t.index + t[0].length;
        break;
      }
    }
    if (depth !== 0) break;
  }
  return out;
}

/** Strip React/Next runtime attributes that mean nothing in a standalone file. */
function clean(svg) {
  return svg
    .replace(/\s(?:data-wow-[a-z]+|data-n-[a-z]+)="[^"]*"/gi, "")
    .replace(/\sclass="([^"]*)"/gi, (all, cls) => {
      const kept = cls
        .split(/\s+/)
        .filter((c) => c && !/^jsx-/.test(c) && !/^wow$/.test(c) && !/^fadeIn/.test(c));
      return kept.length ? ` class="${kept.join(" ")}"` : "";
    })
    .replace(/<!--\s*-->/g, "");
}

const svgs = findSvgs(html).map(clean);

// Deduplicate by content; remember which class each one carried.
const seen = new Map();
for (const svg of svgs) {
  const key = createHash("sha1").update(svg).digest("hex").slice(0, 10);
  if (!seen.has(key)) {
    const cls = (svg.match(/class="([^"]*)"/) || [])[1] || "";
    const w = (svg.match(/width="(\d+)"/) || [])[1] || "?";
    const h = (svg.match(/height="(\d+)"/) || [])[1] || "?";
    seen.set(key, { svg, cls, w, h, count: 1 });
  } else {
    seen.get(key).count++;
  }
}

await mkdir(OUT, { recursive: true });

const index = [];
let n = 0;
for (const [key, info] of seen) {
  const base = (info.cls || "svg").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  const size = `${info.w}x${info.h}`.replace(/[^0-9x]/g, "n"); // "?" is illegal on Windows
  const name = `${base}-${size}-${key}.svg`.replace(/-+/g, "-");
  await writeFile(join(OUT, name), info.svg);
  index.push({ file: name, class: info.cls, size: `${info.w}x${info.h}`, dipakai: info.count, bytes: info.svg.length });
  n++;
}

index.sort((a, b) => b.dipakai - a.dipakai);
await writeFile(join(OUT, "index.json"), JSON.stringify(index, null, 2));

console.log(`SVG unik: ${n} (dari ${svgs.length} kemunculan)`);
console.log(`ditulis ke: ${OUT}`);
for (const i of index) {
  console.log(`  ${String(i.dipakai).padStart(2)}x  ${i.size.padEnd(8)} ${String(i.bytes).padStart(6)}b  ${i.file}`);
}
