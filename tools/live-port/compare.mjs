// Element-by-element comparison of one live page and the rebuild.
//   CMP_PATH=/seminyak/ node compare.mjs [width ...]   (default path "/", widths 1920…390)
//   LOCAL_URL=http://localhost:3100 by default; report in cmp/report<path>.txt
import puppeteer from "puppeteer-core";
import { writeFile, mkdir } from "node:fs/promises";

const PATH = process.env.CMP_PATH || "/";
const LIVE = "https://spabalimoon.com" + PATH;
const LOCAL = (process.env.LOCAL_URL || "http://localhost:3100") + PATH;
const TAG = PATH === "/" ? "" : PATH.split("/").join("_");
const widths = process.argv.slice(2).map(Number).filter(Boolean);
if (!widths.length) widths.push(1920, 1440, 1280, 1024, 768, 390);
await mkdir("cmp", { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  protocolTimeout: 300000,
  args: ["--hide-scrollbars", "--disable-lcd-text", "--font-render-hinting=none"],
});

async function snapshot(url, width) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
  await page.evaluate(() => document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager")));
  await page.waitForNetworkIdle({ idleTime: 800, timeout: 60000 }).catch(() => 0);
  await page.evaluate(async () => {
    document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager"));
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 1500));
    await Promise.race([Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.addEventListener("load", r); i.addEventListener("error", r); })))), new Promise((r) => setTimeout(r, 6000))]);
    await document.fonts.ready;
    await Promise.race([Promise.all([...document.images].map((i) => i.decode().catch(() => 0))), new Promise((r) => setTimeout(r, 15000))]);
  });
  // Freeze: animations to 0, sliders to first slide, preloader gone.
  await page.evaluate(async () => {
    document.getElementById("preloader")?.remove();
    for (const el of document.querySelectorAll(".swiper")) el.swiper?.autoplay?.stop();
    await new Promise((r) => setTimeout(r, 9000)); // let 8s banner zoom transitions finish
    for (const el of document.querySelectorAll(".swiper")) {
      const s = el.swiper;
      if (!s) continue;
      s.autoplay?.stop();
      s.slideToLoop ? s.slideToLoop(0, 0) : s.slideTo(0, 0);
    }
    await new Promise((r) => setTimeout(r, 400));
    for (const a of document.getAnimations()) { try { a.currentTime = 0; a.pause(); } catch {} }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
  const data = await page.evaluate(() => {
    const root = document.body;
    const out = [];
    const skip = new Set(["SCRIPT", "STYLE", "LINK", "META", "NOSCRIPT", "NEXT-ROUTE-ANNOUNCER", "NEXTJS-PORTAL"]);
    // Walk only the live-structured parts: header, sidebar, sections, footer.
    const roots = [
      ...document.querySelectorAll("header.header-area, #menubar, .page-wrapper > section, .page-wrapper > div:not(#menubar), .page-wrapper > main, footer, .whatsapp-float"),
    ];
    const walk = (el, path) => {
      if (skip.has(el.tagName)) return;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const visible = r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
      out.push({
        path,
        tag: el.tagName,
        cls: (el.getAttribute("class") || "").replace(/jsx-[a-z0-9-]+|FrangipaniSpray_\w+|FloralDecoration_\w+|frangipani-spray__[\w-]+|floral-decoration__[\w-]+|\blh\b|swiper-slide-(active|next|prev)|menu-fixed/g, "").trim().replace(/\s+/g, " "),
        text: el.children.length ? "" : (el.textContent || "").trim().slice(0, 40),
        txt: [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join("").replace(/\s+/g, " ").trim(),
        src: el.tagName === "IMG" ? new URL(el.getAttribute("src") || "", location.href).pathname : "",
        href: el.tagName === "A" ? (el.getAttribute("href") || "").replace(/^https?:\/\/(spabalimoon\.com|localhost:3100)/, "").replace(/\/(?=$|[?#])/, "") : "",
        vis: visible,
        x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height),
        fx: r.left, fy: r.top + scrollY, fw: r.width, fh: r.height,
        f: [cs.fontFamily.split(",")[0].replace(/"/g, ""), cs.fontSize, cs.fontWeight, cs.lineHeight, cs.color, cs.backgroundColor, cs.letterSpacing, cs.textTransform, cs.borderRadius, cs.opacity].join("|"),
      });
      [...el.children].forEach((c, i) => walk(c, path + "/" + i));
    };
    roots.forEach((r, i) => walk(r, String(i)));
    return { docH: document.documentElement.scrollHeight, clientW: document.documentElement.clientWidth, els: out };
  });
  await page.screenshot({ path: `cmp/${url.includes("localhost") ? "local" : "live"}${TAG}-${width}.png`, fullPage: true });
  await page.close();
  return data;
}

const report = [];
for (const w of widths) {
  const [a, b] = await Promise.all([snapshot(LIVE, w), snapshot(LOCAL, w)]);
  const map = new Map(b.els.map((e) => [e.path, e]));
  let same = 0, geom = 0, style = 0, missing = 0, struct = 0, content = 0, subpx = 0;
  const lines = [];
  for (const e of a.els) {
    const o = map.get(e.path);
    if (!o) { missing++; if (e.vis) lines.push(`MISSING ${e.path} ${e.tag}.${e.cls} ${e.text}`); continue; }
    if (o.tag !== e.tag || o.cls !== e.cls) { struct++; lines.push(`STRUCT ${e.path} live:${e.tag}.${e.cls} local:${o.tag}.${o.cls}`); continue; }
    if (e.txt !== o.txt || e.src !== o.src || e.href !== o.href) { content++; lines.push(`CONTENT ${e.path} ${e.tag}.${e.cls.slice(0, 30)} live:"${e.txt.slice(0, 80)}" ${e.src} ${e.href} | local:"${o.txt.slice(0, 80)}" ${o.src} ${o.href}`); }
    if (!e.vis && !o.vis) { same++; continue; }
    const dg = Math.max(Math.abs(e.x - o.x), Math.abs(e.y - o.y), Math.abs(e.w - o.w), Math.abs(e.h - o.h));
    const ds = e.f !== o.f;
    if (dg > 1) { geom++; lines.push(`GEOM ${e.path} ${e.tag}.${e.cls.slice(0, 40)} "${e.text}" live[${e.x},${e.y},${e.w},${e.h}] local[${o.x},${o.y},${o.w},${o.h}]`); }
    else if (ds) { style++; lines.push(`STYLE ${e.path} ${e.tag}.${e.cls.slice(0, 40)} "${e.text}"\n     live  ${e.f}\n     local ${o.f}`); }
    else same++;
    // sub-pixel: within the 1px tolerance above but not the same layout (> 1/64px)
    if (dg <= 1 && Math.max(Math.abs(e.fx - o.fx), Math.abs(e.fy - o.fy), Math.abs(e.fw - o.fw), Math.abs(e.fh - o.fh)) > 0.02) { subpx++; if (subpx <= 30) lines.push(`SUBPX ${e.path} ${e.tag}.${e.cls.slice(0, 40)} live[${[e.fx, e.fy, e.fw, e.fh].map((v) => +v.toFixed(3))}] local[${[o.fx, o.fy, o.fw, o.fh].map((v) => +v.toFixed(3))}]`); }
  }
  const extra = b.els.filter((e) => !a.els.some((x) => x.path === e.path)).length;
  const head = `== ${w}px  docH live ${a.docH} local ${b.docH}  clientW ${a.clientW}/${b.clientW}  same ${same}  geom ${geom}  style ${style}  content ${content}  struct ${struct}  missing ${missing}  extra ${extra}  subpx ${subpx}`;
  console.log(head);
  report.push(head, ...lines.slice(0, 400));
}
await writeFile(`cmp/report${TAG}.txt`, report.join("\n"));
await browser.close();
