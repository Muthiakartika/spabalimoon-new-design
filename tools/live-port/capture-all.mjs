import puppeteer from "puppeteer-core";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const sv = JSON.parse(await readFile("pages/survey.json", "utf8"));
await mkdir("pages-dom", { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, protocolTimeout: 300000 });
const only = process.argv.slice(2);
const list = sv.filter((p) => !only.length || only.includes(p.u));
async function grab(p) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 965 });
  await page.goto("https://spabalimoon.com" + p.u, { waitUntil: "networkidle0", timeout: 120000 });
  await page.evaluate(async () => {
    document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager"));
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 1500));
  });
  const html = await page.evaluate(() => document.querySelector(".page-wrapper").outerHTML + (document.querySelector(".whatsapp-float")?.outerHTML || ""));
  await writeFile(`pages-dom/${p.u.replace(/\//g, "_") || "_"}.html`, html);
  await page.close();
  return html.length;
}
const queue = [...list];
await Promise.all([0, 1, 2, 3].map(async () => { while (queue.length) { const p = queue.shift(); try { console.log(p.u, await grab(p)); } catch (e) { console.log("ERR", p.u, e.message); } } }));
await browser.close();
