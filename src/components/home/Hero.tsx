/* eslint-disable @next/next/no-img-element -- the live site serves these as plain <img> */
import { ICON_BOXES } from "@/components/home/icons";
import { LotusIcon } from "@/components/ui/Lotus";
import RowButton from "@/components/ui/RowButton";
import { business } from "@/data/business";
import { home } from "@/data/pages/home";
import { whatsappChatUrl } from "@/lib/whatsapp";

/** Three facts from the hero and about copy, each with a gold line icon. */
const FEATURES = [
  { icon: <LotusIcon width={30} height={31} clip="clip0_v2_hero" />, title: "Since 2009", text: "Seminyak, Bali" },
  { icon: ICON_BOXES[1], title: "Home Service", text: "Hotels & villas nearby" },
  { icon: ICON_BOXES[0], title: "Experienced", text: "Balinese therapists" },
];

/**
 * Homepage v2 hero — text left (kicker, title, copy, two buttons, three
 * facts) over the live banner's cream background, with a treatment photo
 * filling the right side and fading into the cream. Below 992px the photo
 * sits on top and fades down into the text. All type is the live type: the
 * banner title, .sub-title and .btn-two.
 */
export default function Hero() {
  const { hero } = home;
  return (
    <section id="home" className="banner-five-area section__decoration-bottom mb-130 v2-hero">
      <div className="v2-hero__photo">
        <img src="/images/contact/contact-1.webp" alt="A guest relaxing during a back massage at Spa Bali Moon" fetchPriority="high" />
      </div>
      <div className="container">
        <div className="v2-hero__inner">
          <div className="banner-five__content v2-hero__content">
            <div className="section-header">
              <p className="sub-title">Balinese Massage &amp; Spa</p>
            </div>
            <h1 className="title">
              {hero.title} <span>{hero.highlightedTitle}</span>
            </h1>
            <p className="v2-hero__text">{hero.text}</p>
            <div className="v2-hero__actions">
              <RowButton href={whatsappChatUrl} icon="whatsapp" label="Book on WhatsApp" note={business.phoneDisplay} />
              <RowButton href="/seminyak/" icon="tag" label="View Price List" note="Every treatment and price" />
            </div>
            <ul className="v2-hero__features">
              {FEATURES.map((f) => (
                <li key={f.title}>
                  <span className="v2-hero__feature-icon" aria-hidden="true">
                    {f.icon}
                  </span>
                  <span className="v2-hero__feature-text">
                    <strong>{f.title}</strong>
                    <span>{f.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
