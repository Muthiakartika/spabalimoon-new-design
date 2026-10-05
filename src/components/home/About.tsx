/* eslint-disable @next/next/no-img-element -- the live site serves these as plain <img> */
import Link from "next/link";
import { LotusIcon } from "@/components/ui/Lotus";
import { home } from "@/data/pages/home";

/** The gold tick in front of each reason. */
function Tick() {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="jsx-about">
      <path d="M11.5378 22.1558C11.4715 22.1558 11.4059 22.1421 11.3451 22.1155C11.2844 22.0889 11.2298 22.0501 11.1848 22.0014L1.66618 11.705C1.60273 11.6363 1.56066 11.5507 1.54513 11.4585C1.5296 11.3663 1.54128 11.2716 1.57874 11.186C1.61621 11.1003 1.67782 11.0275 1.75605 10.9763C1.83428 10.9251 1.92573 10.8979 2.01921 10.8979H6.60094C6.66973 10.8979 6.73772 10.9126 6.80032 10.9412C6.86292 10.9697 6.91868 11.0113 6.96383 11.0632L10.145 14.723C10.4888 13.9881 11.1543 12.7645 12.3222 11.2734C14.0487 9.06907 17.2602 5.8272 22.7546 2.90066C22.8608 2.8441 22.9843 2.82943 23.1008 2.85952C23.2173 2.88962 23.3183 2.9623 23.3838 3.06321C23.4493 3.16413 23.4746 3.28594 23.4547 3.40459C23.4348 3.52325 23.3711 3.63013 23.2762 3.70412C23.2553 3.72051 21.1368 5.38878 18.6987 8.4445C16.4549 11.2565 13.4721 15.8546 12.0044 21.7907C11.9786 21.8949 11.9186 21.9876 11.834 22.0538C11.7494 22.12 11.6451 22.156 11.5377 22.156L11.5378 22.1558Z" fill="#A78627" className="jsx-about" />
    </svg>
  );
}

/**
 * "Why Spa Bali Moon Is Part of the Bali Experience" — the live
 * about-section-three inside its paper-textured band. `subTitle` replaces
 * live's kicker ("Beyond Relaxation"; the homepage has "About Us").
 */
export default function About({ subTitle }: { subTitle?: string } = {}) {
  const { about } = home;
  const lists = [about.features.slice(0, 3), about.features.slice(3)];
  return (
    <div className="jsx-home homepage-about-paper-section section__decoration-top section__decoration-bottom bg-sub">
      <section id="about" className="jsx-about about-section-three pt-130 pb-130 paralax__animation">
        <div className="jsx-about shape">
          <img loading="lazy" decoding="async" src="/images/shape/about-three-shape.png" alt="image" className="jsx-about animation__floatBob" />
        </div>
        <div className="jsx-about container">
          <div className="jsx-about row g-0 align-items-center">
            <div className="jsx-about col-xl-6 image-column">
              <div className="jsx-about inner-column">
                <div className="jsx-about image">
                  <img loading="lazy" decoding="async" src="/images/home/homepage-3.webp" alt="Spa massage treatment" className="jsx-about image1" />
                </div>
                <img loading="lazy" decoding="async" src="/images/home/homepage-4.webp" alt="Spa treatment room" className="jsx-about image2" />
                <div className="info">
                  <div className="about-brand-mark">
                    <img
                      className="about-brand-mark__logo"
                      src="/images/logo/sbm.webp"
                      alt=""
                      aria-hidden="true"
                      width="56"
                      height="44"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="about-brand-mark__name">{about.brandMark.name}</span>
                    <span className="about-brand-mark__meta">{about.brandMark.meta}</span>
                    <p className="about-brand-mark__text">{about.brandMark.text}</p>
                  </div>
                </div>
                <div className="jsx-about shape-one">
                  <span aria-hidden="true" className="jsx-about about-leaf-gold animation__arryUpDown" />
                </div>
                <div className="jsx-about shape-two">
                  <img loading="lazy" decoding="async" data-depth="0.03" src="/images/about/shape2.png" alt="image" className="jsx-about" />
                </div>
                <div className="jsx-about shape-three">
                  <img loading="lazy" decoding="async" src="/images/about/shape3.png" alt="image" className="jsx-about animation__arryLeftRight" />
                </div>
              </div>
            </div>
            <div className="jsx-about col-xl-6 content-column">
              <div className="jsx-about inner-column">
                <div className="jsx-about section-header">
                  <div data-wow-delay="00ms" data-wow-duration="1500ms" className="jsx-about sub-title look-h4 wow fadeInUp">
                    <LotusIcon className="icon" scope="jsx-about" />
                    {subTitle ?? about.subTitle}
                  </div>
                  <h2 data-wow-delay="200ms" data-wow-duration="1500ms" className="jsx-about title wow fadeInUp">
                    {about.title}
                  </h2>
                  <p data-wow-delay="400ms" data-wow-duration="1500ms" className="jsx-about text wow fadeInUp">
                    {about.text}
                  </p>
                </div>
                <div data-wow-delay="200ms" data-wow-duration="1500ms" className="jsx-about list mt-25 wow fadeInDown">
                  {lists.map((list, i) => (
                    <ul key={i} className="jsx-about">
                      {list.map((feature) => (
                        <li key={feature} className="jsx-about">
                          <Tick />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
                <Link
                  prefetch={false}
                  className="btn-two mt-40 wow fadeInDown"
                  data-wow-delay="400ms"
                  data-wow-duration="1500ms"
                  href={about.cta.href}
                >
                  {about.cta.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
