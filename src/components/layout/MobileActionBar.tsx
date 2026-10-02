import { whatsappChatUrl } from "@/lib/whatsapp";

/**
 * Phones only (below 768px): a bar fixed to the bottom of the screen with a
 * WhatsApp button, in place of the round floating button. The owner compared
 * two layouts (1 Oct) and chose the second one (WhatsApp + Contact Us side by
 * side) with one button only, outlined: the site's pill .btn-two as it is,
 * at the size it had there (half the bar). It sits in the middle for now; a
 * short text such as the opening hours ("9am–11pm") is to go beside it
 * later. Styles in src/styles/custom.css; the floating button only hides
 * while this bar is on the page, so removing it from src/app/layout.tsx
 * brings the floating button back on phones.
 */
export default function MobileActionBar() {
  return (
    <div className="mobile-action-bar lh">
      <div className="mobile-action-bar__row">
        <a href={whatsappChatUrl} target="_blank" rel="noopener noreferrer" className="btn-two mobile-action-bar__btn">
          <i className="fa-brands fa-whatsapp" aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
