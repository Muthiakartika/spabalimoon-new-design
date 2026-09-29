// Readable names for the live site's hashed class names. Shared by
// build-css.mjs (stylesheet) and tojsx.mjs (markup drafts) so both agree.

/** styled-jsx scope hash -> readable scope class. Unlisted hashes stay as-is. */
export const JSX = {
  "jsx-79a2f141362dbd93": "jsx-nav",
  "jsx-b90dcc332ff485c4": "jsx-mobile-menu",
  "jsx-fed456e651c2d4ae": "jsx-sidebar-bloom",
  "jsx-fa73d67a1cbde21f": "jsx-header",
  "jsx-7203bab3b6644ec7": "jsx-about",
  "jsx-5a33fd3d20ab229e": "jsx-catalog",
  "jsx-60af60270c96dd97": "jsx-faq",
  "jsx-269698157d2b09af": "jsx-cta",
  "jsx-4c591e5d761e19b": "jsx-home",
  "jsx-67a47d990120ff0f": "jsx-page-banner",
  "jsx-6016613d29cdec82": "jsx-package-tabs",
  "jsx-f633ad83bf1c1c0": "jsx-pricelist",
  "jsx-f29b86dd6418af3a": "jsx-contact",
  "jsx-92feef8c692e18e8": "jsx-contact-form",
  "jsx-90fa68a8e2750434": "jsx-contact-toast",
  "jsx-9172c2c8ad073e1": "jsx-wa-prompt",
  "jsx-b7267c025d8a53f1": "jsx-outcall",
  "jsx-c26d09e0f8da429a": "jsx-page-title",
  "jsx-85d8cb8e5fc9ac9": "jsx-guide-post",
  "jsx-e1192af723d0e9e5": "jsx-anti-cellulite-massage",
  "jsx-a43c30083df6d2b5": "jsx-treatment-layout",
  "jsx-aaaf0828a2b573f3": "jsx-balinese-massage",
  "jsx-f8fadd9756ae6b27": "jsx-body-scrub",
  "jsx-d77b13a8e747486c": "jsx-coconut-oil-massage",
  "jsx-b847c5c168ca4ec8": "jsx-couple-spa",
  "jsx-b7f7d242e151ec84": "jsx-creambath",
  "jsx-2be135c4dac5e2e3": "jsx-deep-tissue-massage",
  "jsx-76ce2e0fc096ab48": "jsx-ear-wax-removal",
  "jsx-6e0a6bb978bf6561": "jsx-facial",
  "jsx-3a94a4c89c80f308": "jsx-foot-massage",
  "jsx-98465650d3d21c20": "jsx-foot-reflexology",
  "jsx-3ff5b591eee3426d": "jsx-hair-braiding",
  "jsx-e855d3990daa799d": "jsx-head-massage",
  "jsx-b10b50b69e7fab15": "jsx-hot-stone-massage",
  "jsx-ac0a1048868dc8c6": "jsx-lymphatic-drainage-massage",
  "jsx-61ab553e074bb7cd": "jsx-manicure-pedicure",
  "jsx-863d780d399efd21": "jsx-nail-spa",
  "jsx-c71221691239ff4e": "jsx-shiatsu-massage",
  "jsx-23eba92d5c46eb32": "jsx-sport-massage",
  "jsx-4763c11753b9794b": "jsx-sunburn-massage",
  "jsx-71f19891ce04fc21": "jsx-thai-massage",
  "jsx-bd45c14851b67c85": "jsx-traditional-massage",
  "jsx-177639599b4ac4bf": "jsx-waxing-salon",
};

const kebab = (x) => x.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** CSS-module class `FrangipaniSpray_spray__KCYOL` -> `frangipani-spray__spray`. */
export const renameModule = (s) =>
  s.replace(/\b([A-Z][A-Za-z]+)_([A-Za-z0-9]+)__[A-Za-z0-9_-]{5}(?![A-Za-z0-9_-])/g, (_, mod, name) => `${kebab(mod)}__${kebab(name)}`);

export const renameAll = (s) => renameModule(s).replace(/jsx-[0-9a-f]{12,16}\b/g, (m) => JSX[m] ?? m);

/** Page key used for the `p-<key>` class on each page root. */
export const pageKey = (url) => {
  if (url === "/") return "home";
  if (url === "/seminyak/") return "pricelist";
  const parts = url.split("/").filter(Boolean);
  if (parts[0] === "seminyak") return parts[1];
  return parts.join("-");
};
export const pageFile = (url) => url.replace(/\//g, "_") || "_";
