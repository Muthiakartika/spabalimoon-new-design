import sanitizeHtmlLib from "sanitize-html";
import { business } from "@/data/business";

const SITE_HOST = new URL(business.url).host.replace(/^www\./, "");

/**
 * Does this href send the reader to another site? Only absolute http(s) URLs
 * on another host count; relative paths, links back to our own host, in-page
 * fragments, mailto: and tel: stay links.
 */
function leavesTheSite(href?: string): boolean {
  const value = (href || "").trim();
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    return new URL(value).host.replace(/^www\./, "") !== SITE_HOST;
  } catch {
    // An unparseable absolute URL counts as outbound rather than slipping through.
    return true;
  }
}

/**
 * Clean admin-written article HTML before it is rendered on the public site
 * (the live site's lib/sanitize.js, same rules). Keeps what the editor can
 * produce (headings, lists, links, images, quotes, text alignment) and drops
 * scripts, event handlers and javascript: URLs.
 *
 * Outbound links are unwrapped: the anchor becomes a plain <span> and its
 * words stay, so a sentence never loses text, it just stops leading off the
 * site. Internal links (to the treatment pages) are kept.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtmlLib(html, {
    allowedTags: [
      "p", "br", "hr", "span", "div",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "mark", "sub", "sup",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      "*": ["class", "style"],
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      a: (tagName, attribs) => {
        if (leavesTheSite(attribs.href)) return { tagName: "span", attribs: {} };
        // Spread the existing attributes first: replacing them would drop href.
        return { tagName: "a", attribs: { ...attribs, rel: "noopener noreferrer" } };
      },
    },
  });
}
