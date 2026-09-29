// Outcall package tabs + row toggles: compare live and local.
import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, protocolTimeout: 300000 });
const snap = () => [...document.querySelectorAll(".package-tab .nav-link, .tab-content, .tab-pane, .package-block, .package-block .title, .package-row-toggle, .package-child-service, .pricing-dropdown")].map((e) => {
  const r = e.getBoundingClientRect(), s = getComputedStyle(e);
  return `${e.tagName}.${e.className.replace(/jsx-[\w-]+/g, "").trim()} ${Math.round(r.y + scrollY)},${Math.round(r.height)} ${s.display} ${s.opacity} ${(e.children.length ? "" : e.innerText).replace(/\s+/g, " ").slice(0, 30)}`;
}).join("\n");
async function run(base, w) {
  const out = {};
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: 900 });
  await page.goto(base + "/outcall-home-service-massage/", { waitUntil: "networkidle0", timeout: 120000 });
  await page.evaluate(() => document.getElementById("preloader")?.remove());
  await new Promise((r) => setTimeout(r, 1500));
  const tabs = await page.$$(".package-tab .nav-link");
  out.tabs = String(tabs.length);
  for (let i = 0; i < tabs.length; i++) {
    await tabs[i].evaluate((b) => b.click());
    await new Promise((r) => setTimeout(r, 900));
    out[`tab${i}`] = await page.evaluate(snap);
    const toggles = await page.$$(".tab-pane.active .package-row-toggle");
    if (toggles.length) {
      await toggles[0].evaluate((b) => b.click());
      await new Promise((r) => setTimeout(r, 900));
      out[`tab${i}-open`] = await page.evaluate(snap);
      await toggles[0].evaluate((b) => b.click());
      await new Promise((r) => setTimeout(r, 900));
    }
  }
  await page.close();
  return out;
}
for (const w of [1440, 390]) {
  const a = await run("https://spabalimoon.com", w), b = await run((process.env.LOCAL_URL || "http://localhost:3100"), w);
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (a[k] === b[k]) { console.log(w, "same", k, (a[k] || "").split("\n").length, "els"); continue; }
    const la = (a[k] || "").split("\n"), lb = (b[k] || "").split("\n");
    console.log(w, "DIFF", k);
    for (let i = 0; i < Math.max(la.length, lb.length); i++) if (la[i] !== lb[i]) console.log("   live ", la[i], "\n   local", lb[i]);
  }
}
await browser.close();
