/* eslint-disable @next/next/no-img-element -- the live site serves these as plain <img> */
import { FrangipaniMark, FrangipaniSpray } from "@/components/ui/Frangipani";
import { home } from "@/data/pages/home";
import { whatsappChatUrl } from "@/lib/whatsapp";

/** "Our Seminyak Day Spa" — the live banner-five hero, markup for markup. */
export default function Hero() {
  const { hero } = home;
  return (
    <section id="home" className="banner-five-area section__decoration-bottom paralax__animation mb-130">
      <div className="banner-five__shape-one parallaxLeftScroll">
        <img src="/images/shape/about-two-left.png" alt="" aria-hidden="true" />
      </div>
      <FrangipaniSpray />
      <div className="container">
        <div className="banner-five__wrp">
          <div className="banner-five__content">
            <FrangipaniMark />
            <h1 className="title">
              {hero.title} <span>{hero.highlightedTitle}</span>
            </h1>
            <div className="info">
              <a
                href={whatsappChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Book on WhatsApp"
                className="video-btn wow zoomIn"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", borderColor: "#a78627" }}
              >
                <i className="fa-brands fa-whatsapp" style={{ color: "#a78627", fontSize: "45px" }} />
              </a>
              <p className="text">{hero.text}</p>
              <div className="arry">
                <img className="animation__arryUpDown" src="/images/banner/banner-five-arry.png" alt="image" />
              </div>
            </div>
          </div>
          <div className="banner-five__image-left">
            <div className="gsap__parallax">
              <img src="/images/home/homepage-1.webp" alt="Spa towels and candles" />
            </div>
            <img className="shape" data-depth="0.03" src="/images/home/homepage-2.webp" alt="Hot stone spa treatment" />
          </div>
        </div>
      </div>
    </section>
  );
}
