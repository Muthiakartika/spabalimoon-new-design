// Clean a decompiled module: map webpack imports to real names.
import { readFile, writeFile, readdir } from "node:fs/promises";
for (const f of (await readdir("decompiled")).filter((f) => f.endsWith(".jsx"))) {
  let s = await readFile(`decompiled/${f}`, "utf8");
  const imports = JSON.parse(s.match(/\/\/ imports: (\{.*\})/)[1]);
  // interop aliases: o = i.n(r)
  for (const m of s.matchAll(/(\w+) = \w+\.n\((\w+)\)/g)) imports[m[1]] = imports[m[2]];
  const byMod = { 41664: "Link", 9008: "Head", 40645: "JSXStyle", 5152: "dynamic" };
  for (const [v, mod] of Object.entries(imports)) {
    if (byMod[mod]) {
      s = s.replaceAll(`DYNAMIC_${v}_`, byMod[mod]).replaceAll(`(0, ${v}())`, byMod[mod]);
    }
    if (mod === 2261) s = s.replaceAll(`${v}.tq`, "Swiper").replaceAll(`${v}.o5`, "SwiperSlide");
    if (mod === 99304) s = s.replaceAll(`${v}.pt`, "Autoplay").replaceAll(`${v}.tl`, "Pagination").replaceAll(`${v}.W_`, "Navigation");
    if (mod === 67294) s = s.replace(new RegExp(`\(0, ${v}\.(use\w+)\)`, "g"), "$1").replace(new RegExp(`${v}\.(use\w+)`, "g"), "$1");
  }
  s = s.replace(/void 0/g, "undefined");
  // drop styled-jsx <style> elements (their CSS is in live.css)
  s = s.replace(/\s*<JSXStyle id="[0-9a-f]+">[\s\S]*?<\/JSXStyle>/g, "");
  s = s.replace(/\s*<JSXStyle[^>]*\/>/g, "");
  s = s.replace(/\{[^{}()]+&& \(\s*\)\}/g, "");
  await writeFile(`decompiled/${f.replace(".jsx", ".clean.jsx")}`, s);
}
console.log("ok");
