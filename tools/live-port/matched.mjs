// Which rules set a property on an element (CDP), live vs local.
import puppeteer from "puppeteer-core";
//   node matched.mjs /guide/ ".blog-block" width,flex   (first matching element)
const [PATH, SEL, PROPS] = [process.argv[2], process.argv[3], (process.argv[4] || "width").split(",")];
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--hide-scrollbars"] });
for (const base of ["https://spabalimoon.com", (process.env.LOCAL_URL || "http://localhost:3100")]) {
  const p = await browser.newPage();
  await p.setViewport({ width: 1920, height: 965 });
  await p.goto(base + PATH, { waitUntil: "networkidle0", timeout: 120000 });
  const c = await p.createCDPSession();
  await c.send("DOM.enable"); await c.send("CSS.enable");
  const { root } = await c.send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await c.send("DOM.querySelector", { nodeId: root.nodeId, selector: SEL });
  const m = await c.send("CSS.getMatchedStylesForNode", { nodeId });
  console.log("==", base);
  if (m.inlineStyle) for (const pr of m.inlineStyle.cssProperties) if (PROPS.includes(pr.name)) console.log("  inline", pr.name, pr.value);
  for (const r of m.matchedCSSRules) for (const pr of r.rule.style.cssProperties) if (PROPS.includes(pr.name) && !pr.disabled) console.log("  ", r.rule.selectorList.text.slice(0, 120), "|", pr.name, pr.value, pr.important ? "!important" : "");
  await p.close();
}
await browser.close();
