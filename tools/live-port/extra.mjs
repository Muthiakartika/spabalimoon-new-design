import puppeteer from "puppeteer-core";
import { writeFile } from "node:fs/promises";
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 965 });
await page.goto("https://spabalimoon.com/", { waitUntil: "networkidle0", timeout: 120000 });
const out = [];
const n = await page.$$eval(".treatment-catalog__category", (b) => b.length);
for (let i = 0; i < n; i++) {
  await page.evaluate((i) => document.querySelectorAll(".treatment-catalog__category")[i].click(), i);
  await new Promise((r) => setTimeout(r, 300));
  await page.evaluate(() => document.querySelector(".treatment-catalog__toggle")?.click());
  await new Promise((r) => setTimeout(r, 300));
  out.push(await page.$eval("section.treatment-catalog", (s) => s.outerHTML));
}
// header search with results
await page.evaluate(() => document.querySelector(".search-trigger").click());
await new Promise((r) => setTimeout(r, 200));
await page.type(".header-search__input", "mas");
await new Promise((r) => setTimeout(r, 300));
out.push(await page.$eval("header", (s) => s.outerHTML));
await page.evaluate(() => { const i = document.querySelector(".header-search__input"); i.value = ""; });
await page.type(".header-search__input", "zzzz");
await new Promise((r) => setTimeout(r, 300));
out.push(await page.$eval("header", (s) => s.outerHTML));
// sidebar open
await page.setViewport({ width: 390, height: 844 });
await new Promise((r) => setTimeout(r, 500));
await page.evaluate(() => document.querySelector(".menubars").click());
await new Promise((r) => setTimeout(r, 600));
await page.evaluate(() => document.querySelector("#menubar .dropdown-btn")?.click());
await new Promise((r) => setTimeout(r, 400));
out.push(await page.evaluate(() => [...document.querySelectorAll(".sidebar-backdrop, #menubar")].map((e) => e.outerHTML).join("")));
// FAQ: open second item
await page.setViewport({ width: 1920, height: 965 });
await page.evaluate(() => document.querySelectorAll(".faq-section .accordion-button")[1]?.click());
await new Promise((r) => setTimeout(r, 300));
out.push(await page.$eval(".faq-section", (s) => s.outerHTML));
await writeFile("live/extra-blocks.json", JSON.stringify(out));
console.log(out.map((x) => x.length));
await browser.close();
