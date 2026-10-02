"use client";

/* eslint-disable @next/next/no-img-element -- static brand images, as on the live admin */
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/** The admin login card (live pages/admin/login.js). */
export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.replace("/admin/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="adm-login-wrap">
      <div className="adm-glow adm-glow-a" aria-hidden="true" />
      <div className="adm-glow adm-glow-b" aria-hidden="true" />
      <img className="adm-watermark" src="/images/logo/sbm.webp" alt="" aria-hidden="true" />

      <form className="adm-login-card" onSubmit={submit}>
        <div className="adm-card-accent" aria-hidden="true" />

        <div className="adm-login-brand">
          <img src="/images/logo/SMBtitle.svg" alt="Spa Bali Moon" width="444" height="80" />
        </div>

        <div className="adm-divider" aria-hidden="true">
          <span className="adm-line" />
          <span className="adm-eyebrow">Content Studio</span>
          <span className="adm-line" />
        </div>

        <h1 className="adm-login-title">Welcome back</h1>
        <p className="adm-sub">Sign in to manage articles and guides.</p>

        {error && (
          <div className="adm-err" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 7.5v5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="16.3" r="1.05" fill="currentColor" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <label htmlFor="admin-password" className="adm-login-label">
          Password
        </label>
        <div className="adm-field">
          <svg className="adm-lock" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M8 10.5V7.8a4 4 0 1 1 8 0v2.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="12" cy="15.4" r="1.3" fill="currentColor" />
          </svg>
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoComplete="current-password"
            autoFocus
          />
          <button
            type="button"
            className="adm-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            title={showPassword ? "Hide password" : "Show password"}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 12s3.6-6 9-6 9 6 9 6-3.6 6-9 6-9-6-9-6Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
              {showPassword && <path d="M4 20 20 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
            </svg>
          </button>
        </div>

        <button className="adm-submit" type="submit" disabled={loading || !password}>
          {loading ? (
            <>
              <span className="adm-spinner" aria-hidden="true" />
              Processing…
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <p className="adm-foot">Restricted area · Authorised staff only</p>
      </form>
    </div>
  );
}
