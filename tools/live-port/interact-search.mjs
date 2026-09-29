// Guide sidebar search: type "massage", compare the results dropdown (live vs local, 1440 & 390).
import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, protocolTimeout: 300000 });
const res = {};
for (const w of [1440, 390]) for (const base of ["https://spabalimoon.com", (process.env.LOCAL_URL || "http://localhost:3100")]) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: 900 });
  await p.goto(base + "/guide/what-is-thai-massage/", { waitUntil: "networkidle0", timeout: 120000 });
  await p.evaluate(() => document.getElementById("preloader")?.remove());
  await new Promise((r) => setTimeout(r, 1500));
  await p.focus(".sidebar__search-form input");
  await p.keyboard.type("massage", { delay: 50 });
  await new Promise((r) => setTimeout(r, 3000));
  const g = await p.evaluate(() => [...document.querySelectorAll(".sidebar-search-results, .sidebar-search-results li, .sidebar-search-results img, .sidebar-search-results strong, .sidebar-search-results p")].map((e) => {
    const r = e.getBoundingClientRect(), s = getComputedStyle(e);
    return `${e.tagName} ${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)} ${s.fontSize} ${s.color} ${s.boxShadow.slice(0, 20)}`;
  }).join("\n"));
  res[`${w}-${base.includes("localhost") ? "local" : "live"}`] = g;
  const el = await p.$(".sidebar-search-results");
  if (el) await el.screenshot({ path: `cmp/search-${w}-${base.includes("localhost") ? "local" : "live"}.png` });
  await p.close();
}
for (const w of [1440, 390]) console.log(w, res[`${w}-live`] === res[`${w}-local`] ? "IDENTICAL" : "DIFF\n--live\n" + res[`${w}-live`] + "\n--local\n" + res[`${w}-local`]);
await browser.close();
