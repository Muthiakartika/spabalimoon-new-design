// Treatment page: FAQ accordion + service slider arrows, live vs local.
import puppeteer from "puppeteer-core";
const PATH = process.argv[2] || "/seminyak/thai-massage/";   // node interact-treatment.mjs /seminyak/<slug>/
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, protocolTimeout: 300000, args: ["--hide-scrollbars"] });
const snapFaq = () => [...document.querySelectorAll(".faq-section .accordion-item, .faq-section .accordion-button, .faq-section .accordion-collapse")].map((e) => {
  const r = e.getBoundingClientRect(), s = getComputedStyle(e);
  return `${e.tagName}.${e.className.replace(/jsx-[\w-]+/g, "").trim()} h=${Math.round(r.height)} ${s.display} ${s.color}`;
}).join("\n");
const snapSlider = () => [...document.querySelectorAll(".service-slider-two .swiper-wrapper, .service-slider-two .swiper-slide, .service-arry-next-two, .service-arry-prev-two")].map((e) => {
  const r = e.getBoundingClientRect();
  return `${e.className.replace(/jsx-[\w-]+|swiper-slide-(active|next|prev|visible|fully-visible)/g, "").trim().slice(0, 50)} x=${Math.round(r.left)} w=${Math.round(r.width)} ${e.style.transform || ""}`;
}).join("\n");
async function run(base, w) {
  const out = {};
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: 900 });
  await p.goto(base + PATH, { waitUntil: "networkidle0", timeout: 120000 });
  await p.evaluate(() => { document.getElementById("preloader")?.remove(); for (const el of document.querySelectorAll(".swiper")) el.swiper?.autoplay?.stop(); });
  await new Promise((r) => setTimeout(r, 1500));
  out.faq0 = await p.evaluate(snapFaq);
  const buttons = await p.$$(".faq-section .accordion-button");
  for (const i of [1, 2]) if (buttons[i]) { await buttons[i].evaluate((b) => b.click()); await new Promise((r) => setTimeout(r, 900)); out["faq" + i] = await p.evaluate(snapFaq); }
  out.slider0 = await p.evaluate(snapSlider);
  const next = await p.$(".service-arry-next-two");
  out.nextSel = next ? await next.evaluate((e) => e.className.replace(/jsx-[\w-]+/g, "").trim()) : "none";
  if (next) for (const i of [1, 2, 3]) { await next.evaluate((b) => b.click()); await new Promise((r) => setTimeout(r, 1500)); out["slider" + i] = await p.evaluate(snapSlider); }
  const prev = await p.$(".service-arry-prev-two");
  if (prev) { await prev.evaluate((b) => b.click()); await new Promise((r) => setTimeout(r, 1500)); out.sliderBack = await p.evaluate(snapSlider); }
  await p.close();
  return out;
}
for (const w of [1440, 390]) {
  const a = await run("https://spabalimoon.com", w), b = await run((process.env.LOCAL_URL || "http://localhost:3100"), w);
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (a[k] === b[k]) { console.log(w, "same", k, (a[k] || "").split("\n").length); continue; }
    const la = (a[k] || "").split("\n"), lb = (b[k] || "").split("\n");
    console.log(w, "DIFF", k);
    for (let i = 0; i < Math.max(la.length, lb.length); i++) if (la[i] !== lb[i]) console.log("   live ", la[i], "\n   local", lb[i]);
  }
}
await browser.close();
