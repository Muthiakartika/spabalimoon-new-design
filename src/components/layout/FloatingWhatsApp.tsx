import { whatsappChatUrl } from "@/lib/whatsapp";

/** The round WhatsApp button fixed to the bottom right — the live markup. */
export default function FloatingWhatsApp() {
  return (
    <a className="whatsapp-float lh" href={whatsappChatUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
      <i className="fa-brands fa-whatsapp" />
    </a>
  );
}
