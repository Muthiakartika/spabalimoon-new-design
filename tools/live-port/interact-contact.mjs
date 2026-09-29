// Contact form: fill, submit -> WhatsApp prompt; compare live and local.
import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, protocolTimeout: 300000 });
async function run(base) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(base + "/contact/", { waitUntil: "networkidle0", timeout: 120000 });
  await page.evaluate(() => document.getElementById("preloader")?.remove());
  await new Promise((r) => setTimeout(r, 1500));
  await page.type("#rail-form_name", "Test Person");
  await page.type("#rail-form_email", "test@example.com");
  await page.type("#rail-form_subject", "Balinese massage");
  await page.type("#rail-form_message", "Two people tomorrow at 3pm.");
  await page.click("#contact_form button[type=submit]");
  await new Promise((r) => setTimeout(r, 800));
  const s = await page.evaluate(() => {
    const p = document.querySelector(".wa-prompt");
    if (!p) return null;
    const card = p.querySelector(".wa-prompt__card").getBoundingClientRect();
    const btn = p.querySelector(".wa-prompt__btn");
    const cs = getComputedStyle(p);
    return {
      href: btn.getAttribute("href"),
      focused: document.activeElement === btn,
      bodyOverflow: document.body.style.overflow,
      card: [card.x, card.y, card.width, card.height].map(Math.round).join(","),
      overlay: [cs.position, cs.backgroundColor, cs.zIndex].join(" "),
      text: p.innerText.replace(/\s+/g, " "),
    };
  });
  await page.screenshot({ path: `cmp/contact-prompt-${base.includes("localhost") ? "local" : "live"}.png` });
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 400));
  const closed = await page.evaluate(() => !document.querySelector(".wa-prompt") && document.body.style.overflow === "");
  await page.close();
  return { ...s, closed };
}
const a = await run("https://spabalimoon.com"), b = await run((process.env.LOCAL_URL || "http://localhost:3100"));
for (const k of Object.keys(a)) console.log(a[k] === b[k] ? "same" : "DIFF", k, "\n  live ", a[k], a[k] === b[k] ? "" : "\n  local " + b[k]);
await browser.close();
