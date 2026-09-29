import { readFile, writeFile } from "node:fs/promises";
import postcss from "postcss";
import selParser from "postcss-selector-parser";
const src = await readFile(new URL("../../node_modules/tailwindcss/preflight.css", import.meta.url), "utf8");
const root = postcss.parse(src);
root.walkComments((c) => c.remove());
const NOT = ":where(:not(.lh,.lh *))";
const isPseudoEl = (n) => n.type === "pseudo" && (n.value.startsWith("::") || /^:(before|after)$/.test(n.value));
root.walkRules((rule) => {
  if (rule.parent.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
  const sels = selParser().astSync(rule.selector).nodes.map((s) => {
    const t = s.toString().trim();
    if (/^(html|:host)$/.test(t)) return t;
    const nodes = s.nodes;
    let last = -1;
    nodes.forEach((n, i) => { if (n.type === "combinator") last = i; });
    let at = nodes.length;
    for (let i = last + 1; i < nodes.length; i++) if (isPseudoEl(nodes[i])) { at = i; break; }
    const str = (a) => a.map((n) => n.toString()).join("");
    return (str(nodes.slice(0, at)).trim() + NOT + str(nodes.slice(at)).replace(/^\s+/, "")).trim();
  });
  rule.selector = sels.join(",\n");
});
const header = `/**
 * Tailwind's preflight, kept out of the live-theme subtrees.
 *
 * Generated from node_modules/tailwindcss/preflight.css: every selector gets
 * \`${NOT}\`, so the reset never touches an element inside \`.lh\` (the
 * header, footer and homepage, which carry the live site's own Bootstrap
 * reboot in src/styles/live.css). Everywhere else it behaves exactly like the
 * stock preflight. Regenerate it after upgrading Tailwind.
 */
`;
await writeFile(new URL("../../src/styles/preflight-scoped.css", import.meta.url), header + root.toString().replace(/\n{3,}/g, "\n\n"));
console.log("ok");
