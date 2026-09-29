"use client";

/* eslint-disable @next/next/no-img-element -- the live site serves these as plain <img> */
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { business } from "@/data/business";
import { footerDaySpaLink, footerHomeServices, legalLinks } from "@/data/navigation";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Site footer — the live "footer-two-area--white-simple": five columns, then
 * one centred copyright line. The newsletter posts to /api/subscribe/ and
 * shows the reply under the field for 5 seconds, as on the live site.
 */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function subscribe(e: FormEvent) {
    e.preventDefault();
    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "Thanks for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Subscription failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection.");
    }
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 5000);
  }

  return (
    <footer className="footer-two-area footer-two-area--white-simple lh">
      <div className="footer__shape">
        <img loading="lazy" decoding="async" src="/images/shape/footer-shape-left.png" alt="shape" />
      </div>
      <div className="container">
        <div className="row g-5">
          <div className="col-md-6 col-xl-3">
            <div className="footer__item">
              <div className="footer-about">
                <div>
                  <Link prefetch={false} href="/" className="logo footer__brand">
                    <img loading="lazy" decoding="async" src="/images/logo/SMBtitle-footer.svg" alt={business.name} />
                  </Link>
                  <p className="text">
                    Spa Bali Moon offers high-quality traditional massages and spa therapies, with outcall and home
                    services by skilled therapists specializing in Balinese Body Massage.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-xl-2">
            <div className="footer__item">
              <h3 className="title">Contact Us</h3>
              <ul className="links">
                <li className="footer__field">
                  <span className="footer__field-label">Phone:</span>
                  <span className="footer__field-value">{business.phoneDisplay}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-6 col-xl-2">
            <div className="footer__item">
              <h3 className="title">
                <Link prefetch={false} href={footerDaySpaLink.href} style={{ color: "inherit" }}>
                  {footerDaySpaLink.label}
                </Link>
              </h3>
              <ul className="time-table">
                <li className="footer__field">
                  <span className="footer__field-label">{business.openingHours.label}:</span>
                  <span className="footer__field-value">{business.openingHours.display}</span>
                </li>
                <li className="footer__field">
                  <span className="footer__field-label">Address:</span>
                  <span className="footer__field-value">{business.address.short}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-6 col-xl-2">
            <div className="footer__item">
              <h3 className="title">
                <Link prefetch={false} href={footerHomeServices.href} style={{ color: "inherit" }}>
                  {footerHomeServices.label}
                </Link>
              </h3>
              <ul className="links">
                {footerHomeServices.items.map((item) => (
                  <li key={item.label}>
                    <Link prefetch={false} href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="footer__field footer__field--spaced">
                  <span className="footer__field-label">Home service fee:</span>
                  <span className="footer__field-value">75k / therapist</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md-12 col-xl-3">
            <div className="footer__item">
              <div className="footer__newsletter-block">
                <h3 className="title">Join Our Newsletter</h3>
                <div className="newsletter footer__newsletter">
                  <form className="input" onSubmit={subscribe}>
                    <input
                      type="email"
                      placeholder="Your Email"
                      aria-label="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === "loading"}
                      required
                    />
                    <button type="submit" disabled={status === "loading"}>
                      {status === "loading" ? "Sending..." : "Subscribe"}
                    </button>
                  </form>
                  {message ? (
                    <p className="footer__newsletter-note" style={{ color: status === "success" ? "#28a745" : "#dc3545" }}>
                      {message}
                    </p>
                  ) : (
                    <p className="footer__newsletter-note">Just the occasional note about new treatments and offers.</p>
                  )}
                </div>
              </div>
              <div className="footer__payments">
                <h3 className="title">Accepted Payments:</h3>
                <div className="footer__payment-list">
                  <span className="footer__payment-card" role="img" aria-label="Mastercard">
                    <svg width="40" height="25" viewBox="0 0 48 30" fill="none" aria-hidden="true">
                      <circle cx="18.5" cy="15" r="11.5" fill="#EB001B" />
                      <circle cx="29.5" cy="15" r="11.5" fill="#F79E1B" />
                      <path d="M24 6.06a11.48 11.48 0 0 0 0 17.88 11.48 11.48 0 0 0 0-17.88Z" fill="#FF5F00" />
                    </svg>
                  </span>
                  <span className="footer__payment-card" role="img" aria-label="Visa">
                    <span className="footer__payment-visa">VISA</span>
                  </span>
                  <span className="footer__payment-card" role="img" aria-label="Cash">
                    <svg width="28" height="19" viewBox="0 0 26 18" fill="none" aria-hidden="true">
                      <rect x="1" y="1" width="24" height="16" rx="3" fill="#EDF5EF" stroke="#2F7D5B" strokeWidth="1.5" />
                      <circle cx="13" cy="9" r="3.6" fill="none" stroke="#2F7D5B" strokeWidth="1.5" />
                      <path d="M4.6 4.6h1.8M19.6 13.4h1.8" stroke="#2F7D5B" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="footer__payment-label">Cash</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="footer__bottom"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "40px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(95, 90, 84, 0.12)",
          }}
        >
          <p className="copyright-text" style={{ textAlign: "center", marginBottom: 0 }}>
            All Rights Reserved © {new Date().getFullYear()}{" "}
            <Link prefetch={false} href="/">
              {business.name}
            </Link>
            {" · "}
            <Link prefetch={false} href={legalLinks[0].href}>
              {legalLinks[0].label}
            </Link>
            {" · "}
            <Link prefetch={false} href={legalLinks[1].href}>
              {legalLinks[1].label}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
