"use client";

/* eslint-disable @next/next/no-img-element -- the live site serves this as a plain <img> */
import { useEffect, useState } from "react";

/**
 * The live site's loading screen: the lotus logo over four panels, shown on
 * the first page load only. It leaves two frames after 250ms, or at 1s at the
 * latest — the same timing as the live _app.
 */
export default function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let done = false;
    const hide = () => {
      if (!done) {
        done = true;
        setVisible(false);
      }
    };
    const soon = window.setTimeout(() => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(hide));
    }, 250);
    const latest = window.setTimeout(hide, 1000);
    return () => {
      window.clearTimeout(soon);
      window.clearTimeout(latest);
    };
  }, []);

  if (!visible) return null;
  return (
    <div id="preloader" className="lh">
      <div className="animation-preloader">
        <div className="preloader-mark">
          <img
            className="preloader-logo"
            fetchPriority="high"
            decoding="async"
            src="/images/logo/sbm.webp"
            alt="Spa Bali Moon logo"
            width="280"
            height="219"
          />
        </div>
        <div className="preloader-brand">Spa Bali Moon</div>
        <p className="text-center">Loading...</p>
      </div>
      <div className="loader">
        <div className="row">
          <div className="col-3 loader-section section-left">
            <div className="bg" />
          </div>
          <div className="col-3 loader-section section-left">
            <div className="bg" />
          </div>
          <div className="col-3 loader-section section-right">
            <div className="bg" />
          </div>
          <div className="col-3 loader-section section-right">
            <div className="bg" />
          </div>
        </div>
      </div>
    </div>
  );
}
