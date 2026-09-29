// Compare interactive states: sticky header, search, catalog tabs + toggle, FAQ, mobile menu.
import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, protocolTimeout: 300000 });
const rect = (sel) => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), cs.backgroundColor, cs.boxShadow.slice(0, 40), cs.opacity, cs.visibility, cs.transform.slice(0, 30)].join(" ") })()`;
async function run(url) {
  const out = {};
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1200));
  // sticky header
  await page.mouse.wheel({ deltaY: 1500 });
  await new Promise((r) => setTimeout(r, 2500));
  out.headerScrolled = await page.evaluate(`[document.querySelector("header").className.replace(/jsx-\S+|\blh\b/g,"").trim(), ${rect("header")}, ${rect(".header__main")}]`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1500));
  // mega menu hover
  await page.hover(".treatments-menu-item > a");
  await new Promise((r) => setTimeout(r, 800));
  out.mega = await page.evaluate(`[${rect(".treatment-mega-menu")}, ${rect(".treatment-mega-menu__link-item a")}]`);
  await page.hover(".blog-menu-item > a");
  await new Promise((r) => setTimeout(r, 800));
  out.blog = await page.evaluate(`[${rect(".blog-dropdown-menu")}, ${rect(".blog-dropdown-menu li:nth-child(2) a")}]`);
  await page.mouse.move(700, 500);
  // search
  await page.click(".search-trigger");
  await new Promise((r) => setTimeout(r, 600));
  await page.keyboard.type("thai");
  await new Promise((r) => setTimeout(r, 600));
  out.search = await page.evaluate(`[${rect(".header-search__dropdown")}, ${rect(".header-search__results")}, [...document.querySelectorAll(".header-search__result span")].map(s=>s.textContent).join(","), document.querySelector(".search-trigger i").className.replace(/jsx-\S+/g,"").trim()]`);
  await page.keyboard.press("Escape");
  // catalog tab + toggle
  await page.evaluate(() => document.querySelectorAll(".treatment-catalog__category")[1].click());
  await new Promise((r) => setTimeout(r, 500));
  await page.evaluate(() => document.querySelectorAll(".treatment-catalog__toggle")[2].click());
  await new Promise((r) => setTimeout(r, 1200));
  out.catalog = await page.evaluate(`[[...document.querySelectorAll(".treatment-catalog__item .title")].map(t=>t.textContent).join(","), ${rect(".treatment-catalog__item.is-open")}, ${rect(".treatment-catalog__item.is-open .treatment-catalog__dropdown")}, ${rect("section.treatment-catalog")}]`);
  // faq
  await page.evaluate(() => document.querySelectorAll(".faq-section .accordion-button")[3].click());
  await new Promise((r) => setTimeout(r, 600));
  out.faq = await page.evaluate(`[[...document.querySelectorAll(".accordion-collapse")].map(c=>c.className.includes("show")?1:0).join(""), ${rect(".faq-section")}, ${rect(".accordion-collapse.show")}]`);
  // mobile menu
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 800));
  await page.click(".menubars");
  await new Promise((r) => setTimeout(r, 900));
  await page.evaluate(() => document.querySelector("#menubar .dropdown-btn").click());
  await new Promise((r) => setTimeout(r, 900));
  out.mobile = await page.evaluate(`[${rect("#menubar")}, ${rect(".sidebar-backdrop")}, ${rect("#menubar .mobile-submenu.is-open")}, ${rect("#menubar .sidebar__contact-info")}, ${rect(".sidebar-bloom")}]`);
  await page.close();
  return out;
}
const a = await run("https://spabalimoon.com/");
const b = await run((process.env.LOCAL_URL || "http://localhost:3100") + "/");
for (const k of Object.keys(a)) {
  const same = JSON.stringify(a[k]) === JSON.stringify(b[k]);
  console.log(same ? "SAME " : "DIFF ", k);
  if (!same) console.log("   live ", JSON.stringify(a[k]), "\n   local", JSON.stringify(b[k]));
}
await browser.close();
