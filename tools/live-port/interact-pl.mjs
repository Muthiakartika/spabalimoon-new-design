import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, protocolTimeout: 300000 });
async function run(base) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(base + "/seminyak/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));
  const out = [];
  for (const t of [1, 2, 0]) {
    await page.evaluate((t) => document.querySelectorAll(".package-tab .nav-link")[t].click(), t);
    await new Promise((r) => setTimeout(r, 600));
    await page.evaluate(() => document.querySelector(".tab-pane.active .package-row-toggle")?.click());
    await new Promise((r) => setTimeout(r, 1200));
    out.push(await page.evaluate(() => {
      const sec = document.querySelector(".package-section").getBoundingClientRect();
      const dd = document.querySelector(".tab-pane.active .pricing-dropdown");
      const r = dd.getBoundingClientRect();
      return [Math.round(sec.height), Math.round(r.height), getComputedStyle(dd).visibility, document.querySelector(".tab-pane.active .inner-box h3").textContent.trim()];
    }));
  }
  await page.close();
  return out;
}
const a = await run("https://spabalimoon.com"), b = await run((process.env.LOCAL_URL || "http://localhost:3100"));
console.log("live ", JSON.stringify(a)); console.log("local", JSON.stringify(b)); console.log(JSON.stringify(a) === JSON.stringify(b) ? "SAME" : "DIFF");
await browser.close();
