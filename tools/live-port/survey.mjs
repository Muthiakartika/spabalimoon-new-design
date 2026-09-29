import { writeFile, mkdir } from "node:fs/promises";
const treatments = ["anti-cellulite-massage","balinese-massage","body-scrub","coconut-oil-massage","couple-spa","creambath","day-spa","deep-tissue-massage","ear-wax-removal","facial","foot-massage","foot-reflexology","hair-braiding","head-massage","hot-stone-massage","lymphatic-drainage-massage","manicure-pedicure","nail-spa","shiatsu-massage","sport-massage","sunburn-massage","thai-massage","traditional-massage","waxing-salon"];
const guides = ["lymphatic-drainage-massage-benefits-techniques-what-to-expect","what-is-a-balinese-massage","what-is-thai-massage","understanding-of-facial-massage","understanding-slimming-massage","best-massages-after-a-long-flight","iv-drip"];
const urls = ["/", "/404/", "/seminyak/", "/contact/", "/reservation/", "/massage-kuta/", "/outcall-home-service-massage/", "/villa-hotel-massage/", "/wellness-in-bali/", "/privacy-policy/", "/terms-and-conditions/", "/guide/", ...guides.map((g) => `/guide/${g}/`), ...treatments.map((t) => `/seminyak/${t}/`)];
await mkdir("pages", { recursive: true });
const out = [];
for (const u of urls) {
  const html = await (await fetch("https://spabalimoon.com" + u)).text();
  const css = [...new Set([...html.matchAll(/\/_next\/static\/css\/([0-9a-f]+)\.css/g)].map((m) => m[1]))];
  const jsx = [...html.matchAll(/<style id="__jsx-([0-9a-f]+)"/g)].map((m) => m[1]);
  const page = (html.match(/"page":"([^"]+)"/) || [])[1];
  await writeFile(`pages/${u.replace(/\//g, "_") || "_"}.html`, html);
  out.push({ u, page, css, jsx, len: html.length });
  console.log(u.padEnd(75), page, "css:", css.join(","), "jsx:", jsx.length);
}
await writeFile("pages/survey.json", JSON.stringify(out, null, 1));
