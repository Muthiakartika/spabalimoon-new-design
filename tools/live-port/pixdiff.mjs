import { readFile, writeFile } from "node:fs/promises";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
for (const w of process.argv.slice(2)) {
  const a = PNG.sync.read(await readFile(`cmp/live-${w}.png`));
  const b = PNG.sync.read(await readFile(`cmp/local-${w}.png`));
  const W = Math.min(a.width, b.width), H = Math.min(a.height, b.height);
  const crop = (img) => { const o = new PNG({ width: W, height: H }); PNG.bitblt(img, o, 0, 0, W, H, 0, 0); return o; };
  const A = crop(a), B = crop(b), D = new PNG({ width: W, height: H });
  const n = pixelmatch(A.data, B.data, D.data, W, H, { threshold: 0.1 });
  // per 200px band
  const bands = [];
  for (let y0 = 0; y0 < H; y0 += 200) {
    let c = 0;
    for (let y = y0; y < Math.min(H, y0 + 200); y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (D.data[i] === 255 && D.data[i + 1] === 0) c++; }
    if (c > 50) bands.push(`${y0}:${c}`);
  }
  await writeFile(`cmp/diff-${w}.png`, PNG.sync.write(D));
  console.log(w, `size ${a.width}x${a.height} vs ${b.width}x${b.height}`, "diff px", n, "bands", bands.join(" "));
}
