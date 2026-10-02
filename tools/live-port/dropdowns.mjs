// Opens every dropdown / accordion / toggle on every page, on live and on the
// rebuild, and counts how many characters of the revealed content are actually
// visible (not visibility-hidden/collapsed, not opacity 0, not zero-size, not
// clipped). Catches text that is in the HTML but never shows.
//   node dropdowns.mjs   -> cmp/dropdowns.json + one line per difference
// LOCAL_URL overrides the rebuild address (default http://localhost:3100).
// Each worker gets its own browser: a background tab renders no frames, so
// CSS transitions stall and every panel would read as hidden.
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const treatments = ["anti-cellulite-massage","balinese-massage","body-scrub","coconut-oil-massage","couple-spa","creambath","day-spa","deep-tissue-massage","ear-wax-removal","facial","foot-massage","foot-reflexology","hair-braiding","head-massage","hot-stone-massage","lymphatic-drainage-massage","manicure-pedicure","nail-spa","shiatsu-massage","sport-massage","sunburn-massage","thai-massage","traditional-massage","waxing-salon"];
const guides = ["lymphatic-drainage-massage-benefits-techniques-what-to-expect","what-is-a-balinese-massage","what-is-thai-massage","understanding-of-facial-massage","understanding-slimming-massage","best-massages-after-a-long-flight","iv-drip"];
const paths = ["/", "/404/", "/seminyak/", "/contact/", "/reservation/", "/massage-kuta/", "/outcall-home-service-massage/", "/villa-hotel-massage/", "/wellness-in-bali/", "/privacy-policy/", "/terms-and-conditions/", "/guide/", ...guides.map((g) => `/guide/${g}/`), ...treatments.map((t) => `/seminyak/${t}/`)];
const SITES = { live: "https://spabalimoon.com", local: process.env.LOCAL_URL || "http://localhost:3100" };

function installHelpers() {
  window.__vis = (root) => {
    let total = 0, shown = 0;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const t = w.currentNode.nodeValue.replace(/\s+/g, "");
      if (!t) continue;
      total += t.length;
      const el = w.currentNode.parentElement;
      if (el.closest(".sr-only, .visually-hidden")) { shown += t.length; continue; }
      const r = el.getBoundingClientRect();
      let ok = r.width > 0 && r.height > 0 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
      if (ok) {
        let box = { l: r.left, t: r.top, r: r.right, b: r.bottom };
        for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
          const cs = getComputedStyle(a);
          if (cs.overflowX !== "visible" || cs.overflowY !== "visible") {
            const ar = a.getBoundingClientRect();
            box = { l: Math.max(box.l, ar.left), t: Math.max(box.t, ar.top), r: Math.min(box.r, ar.right), b: Math.min(box.b, ar.bottom) };
            if (box.r - box.l < 1 || box.b - box.t < 1) { ok = false; break; }
          }
        }
      }
      if (ok) shown += t.length;
    }
    return { total, shown };
  };
  window.__sleep = (ms) => new Promise((r) => setTimeout(r, ms));
}

async function checkPage(browser, base, path) {
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(base + path, { waitUntil: "networkidle2", timeout: 120000 });
  await p.addStyleTag({ content: "#preloader{display:none!important}" });
  await p.bringToFront();
  await p.evaluate(installHelpers);
  const out = await p.evaluate(async () => {
    const out = [];
    const sleep = window.__sleep, vis = window.__vis;
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await sleep(30); }
    await sleep(1200);
    for (const a of document.getAnimations()) { try { a.finish(); } catch {} }
    const rec = (kind, label, root) => { const v = vis(root); out.push({ kind, label: label.replace(/\s+/g, " ").trim().slice(0, 60), ...v }); };
    // 1. FAQ accordions (one open at a time)
    for (const btn of document.querySelectorAll(".accordion-button")) {
      const item = btn.closest(".accordion-item");
      if (btn.classList.contains("collapsed")) btn.click();
      await sleep(900);
      rec("faq", btn.textContent, item.querySelector(".accordion-body") || item);
    }
    // 2. Price-list tabs + row toggles
    for (const tab of document.querySelectorAll("[id^=package-item-][id$=-tab]")) {
      tab.click();
      await sleep(400);
      const pane = document.getElementById(tab.id.replace(/-tab$/, ""));
      for (const t of pane.querySelectorAll(".package-row-toggle")) if (t.getAttribute("aria-expanded") !== "true") t.click();
      await sleep(900);
      for (const box of pane.querySelectorAll(".inner-box")) {
        const d = box.querySelector(".pricing-dropdown");
        if (d) rec("price:" + tab.textContent.trim(), box.querySelector(".title")?.textContent || "", d);
      }
    }
    // 3. Home treatment catalog: every category, every item opened
    for (const cat of [...document.querySelectorAll(".treatment-catalog__category")]) {
      cat.click();
      await sleep(400);
      for (const t of [...document.querySelectorAll(".treatment-catalog__toggle")]) {
        if (!t.offsetParent) continue;
        t.click();
        await sleep(900);
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) rec("catalog:" + cat.textContent.trim(), t.closest(".treatment-catalog__content")?.querySelector(".title")?.textContent || "", panel);
      }
    }
    // 4. Testimonial "Read more"
    let qi = 0;
    for (const q of document.querySelectorAll(".quote-toggle")) {
      if (!q.offsetParent) continue;
      q.click();
      await sleep(500);
      const text = document.getElementById(q.getAttribute("aria-controls"));
      if (text) rec("readmore", "#" + qi++, text);
    }
    return out;
  });
  await p.close();
  return out;
}

// Global chrome, once per site: desktop nav dropdowns (hover), mobile menu submenus, guide search.
async function checkChrome(browser, base) {
  const out = [];
  let p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(base + "/", { waitUntil: "networkidle2", timeout: 120000 });
  await p.addStyleTag({ content: "#preloader{display:none!important}" });
  await p.bringToFront();
  await p.evaluate(installHelpers);
  for (const li of await p.$("header .main-menu nav > ul > li")) {
    if (!(await li.evaluate((l) => !!l.querySelector("ul")))) continue;
    await li.hover();
    await new Promise((r) => setTimeout(r, 800));
    out.push(await li.evaluate((l) => ({ kind: "nav-hover", label: l.querySelector("a")?.textContent.trim() || "", ...window.__vis(l.querySelector("ul")) })));
  }
  await p.close();

  p = await browser.newPage();
  await p.setViewport({ width: 390, height: 800, isMobile: true, hasTouch: true });
  await p.goto(base + "/", { waitUntil: "networkidle2", timeout: 120000 });
  await p.addStyleTag({ content: "#preloader{display:none!important}" });
  await p.bringToFront();
  await p.evaluate(installHelpers);
  out.push(...(await p.evaluate(async () => {
    const out = [];
    const btn = [...document.querySelectorAll("header button, header a")].find((b) => b.offsetParent && /sidebar|menu|grid|bars/i.test(b.outerHTML) && !/whatsapp|tel:/i.test(b.outerHTML));
    btn?.click();
    await window.__sleep(900);
    const side = document.querySelector(".sidebar-area");
    out.push({ kind: "mobile-menu", label: "panel", ...window.__vis(side) });
    for (const d of side.querySelectorAll(".dropdown-btn")) {
      d.click();
      await window.__sleep(800);
      const li = d.closest("li") || d.parentElement;
      out.push({ kind: "mobile-submenu", label: d.getAttribute("aria-label") || "", ...window.__vis(li.querySelector("ul") || li) });
    }
    return out;
  })));
  await p.close();

  p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(base + "/guide/what-is-thai-massage/", { waitUntil: "networkidle2", timeout: 120000 });
  await p.addStyleTag({ content: "#preloader{display:none!important}" });
  await p.bringToFront();
  await p.evaluate(installHelpers);
  const input = await p.$("aside input, .sidebar input, input[type=search]");
  if (input) {
    await input.evaluate((i) => i.scrollIntoView({ block: "center" }));
    await input.type("massage", { delay: 30 });
    await new Promise((r) => setTimeout(r, 1200));
    out.push(await input.evaluate((i) => {
      const box = i.closest("form, .search-box, .widget, aside") || i.parentElement;
      return { kind: "guide-search", label: "massage", ...window.__vis(box) };
    }));
  } else out.push({ kind: "guide-search", label: "no input found", total: 0, shown: 0 });
  await p.close();
  return out;
}

{
  const launch = () => puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, protocolTimeout: 600000 });
  const browser = await launch();
  const results = { live: {}, local: {} };
  const q = [];
  for (const path of paths) for (const site of Object.keys(SITES)) q.push({ site, path });
  await Promise.all([0, 1, 2].map(async () => {
    const own = await launch();
    while (q.length) {
      const { site, path } = q.shift();
      try { results[site][path] = await checkPage(own, SITES[site], path); }
      catch (e) { results[site][path] = [{ kind: "ERROR", label: String(e).slice(0, 80), total: 0, shown: 0 }]; }
      process.stderr.write(".");
    }
    await own.close();
  }));
  for (const site of Object.keys(SITES)) {
    try { results[site]["(chrome)"] = await checkChrome(browser, SITES[site]); }
    catch (e) { results[site]["(chrome)"] = [{ kind: "ERROR", label: String(e).slice(0, 80), total: 0, shown: 0 }]; }
  }
  await browser.close();
  fs.mkdirSync("cmp", { recursive: true });
  fs.writeFileSync("cmp/dropdowns.json", JSON.stringify(results, null, 1));

  let checks = 0, localHidden = 0, liveHidden = 0;
  const lines = [];
  const key = (x) => `${x.kind}|${x.label}`;
  for (const path of [...paths, "(chrome)"]) {
    const L = results.live[path] || [], R = results.local[path] || [];
    const lm = new Map(L.map((x) => [key(x), x]));
    const rm = new Map(R.map((x) => [key(x), x]));
    for (const x of R) {
      checks++;
      const lv = lm.get(key(x));
      if (x.kind === "ERROR") lines.push(`ERROR         ${path} ${x.label}`);
      else if (x.shown < x.total) { localHidden++; lines.push(`LOCAL HIDDEN  ${path} ${x.kind} "${x.label}" visible ${x.shown}/${x.total}${lv ? ` (live ${lv.shown}/${lv.total})` : ""}`); }
      else if (lv && lv.total !== x.total) lines.push(`TEXT DIFFERS  ${path} ${x.kind} "${x.label}" local ${x.total} chars, live ${lv.total}`);
      if (!lv) lines.push(`ONLY LOCAL    ${path} ${x.kind} "${x.label}" ${x.shown}/${x.total}`);
    }
    for (const x of L) {
      if (x.shown < x.total) liveHidden++;
      if (!rm.has(key(x))) lines.push(`ONLY LIVE     ${path} ${x.kind} "${x.label}" ${x.shown}/${x.total}`);
    }
  }
  console.log(`\n${checks} local checks, ${localHidden} with hidden text (live: ${liveHidden})`);
  console.log(lines.join("\n") || "no differences");
}
