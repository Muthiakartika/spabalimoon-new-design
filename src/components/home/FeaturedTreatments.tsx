"use client";

/* eslint-disable @next/next/no-img-element -- the live site serves these as plain <img> */
import Link from "next/link";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { treatmentSlides } from "@/data/pages/home";

/**
 * Treatment slider — the live feature-section: two horizontal cards per view
 * from 991px (one below), 30px apart, looping, 5s autoplay, prev/next arrows.
 */
export default function FeaturedTreatments() {
  return (
    <div className="jsx-home homepage-service-slider">
      <section id="projects" className="feature-section pb-100">
        <div className="container">
          <Swiper
            modules={[Autoplay, Navigation]}
            slidesPerView={2}
            spaceBetween={30}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop
            navigation={{ nextEl: ".feature-arry-next", prevEl: ".feature-arry-prev" }}
            breakpoints={{
              320: { slidesPerView: 1 },
              575: { slidesPerView: 1 },
              767: { slidesPerView: 1 },
              991: { slidesPerView: 2 },
              1199: { slidesPerView: 2 },
              1350: { slidesPerView: 2 },
            }}
            className="swiper feature-slider"
          >
            {treatmentSlides.map((t) => (
              <SwiperSlide key={t.href || t.name} className="feature-block swiper-slide">
                <div className="inner-box">
                  <div className="image-box">
                    <img loading="lazy" decoding="async" src={t.image} alt={t.name} />
                  </div>
                  <div className="content-box">
                    <div className="icon">
                      <img loading="lazy" decoding="async" src={t.icon} alt={t.name} style={{ width: "80px", height: "80px" }} />
                    </div>
                    <div className="info">
                      {t.price && <h6 className="sub-title">{t.price}</h6>}
                      <h3>
                        <Link prefetch={false} href={t.href || "/seminyak/"}>
                          {t.name}
                        </Link>
                      </h3>
                      <p className="text">Relax and rejuvenate your body and soul.</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="feature-arrys mt-60">
            <div className="wrp">
              <button type="button" className="feature-arry-prev" aria-label="Previous slide">
                <i className="fa-regular fa-angle-left" aria-hidden="true" />
              </button>
              <button type="button" className="feature-arry-next" aria-label="Next slide">
                <i className="fa-regular fa-angle-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
