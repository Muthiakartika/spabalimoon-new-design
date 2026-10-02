"use client";

/* eslint-disable @next/next/no-img-element -- static brand images, as on the live admin */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { BlogSetup } from "@/lib/blog/setup";
import type { PostRow } from "@/lib/blog/types";
import AdminNotice from "./AdminNotice";

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 5.5v13M5.5 12h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TrashIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 7h14M9.5 7V5.6A1.1 1.1 0 0 1 10.6 4.5h2.8A1.1 1.1 0 0 1 14.5 5.6V7m2 0v11.4a1.6 1.6 0 0 1-1.6 1.6H9.1a1.6 1.6 0 0 1-1.6-1.6V7"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10.4 10.8v5.4M13.6 10.8v5.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

/** The article list (live pages/admin/index.js): stats, table, delete dialog. */
export default function Dashboard({
  initialPosts,
  setup,
  loadError,
}: {
  initialPosts: PostRow[];
  setup: BlogSetup;
  loadError?: string;
}) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmPost, setConfirmPost] = useState<PostRow | null>(null);
  const [error, setError] = useState(loadError ?? "");

  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.length - published;

  // Escape closes the delete dialog, unless the delete is already running.
  useEffect(() => {
    if (!confirmPost) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busyId) setConfirmPost(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmPost, busyId]);

  const logout = async () => {
    await fetch("/api/admin/logout/", { method: "POST" });
    router.replace("/admin/login/");
    router.refresh();
  };

  const remove = async (post: PostRow) => {
    setBusyId(post.id);
    setError("");
    const res = await fetch(`/api/admin/posts/${post.id}/`, { method: "DELETE" });
    setBusyId(null);
    setConfirmPost(null);
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } else {
      const data = await res.json().catch(() => ({}));
      setError(`Failed to delete “${post.title}”: ${data.error || res.status}`);
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-bg" aria-hidden="true">
        <span className="adm-glow adm-glow-a" />
        <span className="adm-glow adm-glow-b" />
        <img className="adm-watermark" src="/images/logo/sbm.webp" alt="" />
      </div>

      <header className="adm-topbar">
        <div className="adm-topbar-inner">
          <Link href="/admin/" className="adm-brand">
            <img src="/images/logo/SMBtitle.svg" alt="Spa Bali Moon" width="444" height="80" />
            <span className="adm-eyebrow">Content Studio</span>
          </Link>
          <div className="adm-top-actions">
            <Link href="/admin/new/" className="adm-btn adm-btn-primary">
              <PlusIcon />
              New Article
            </Link>
            <button type="button" className="adm-btn adm-btn-ghost" onClick={logout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M14.5 8.2V6.4A1.9 1.9 0 0 0 12.6 4.5H6.4A1.9 1.9 0 0 0 4.5 6.4v11.2a1.9 1.9 0 0 0 1.9 1.9h6.2a1.9 1.9 0 0 0 1.9-1.9v-1.8"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M10 12h9.5m0 0-2.7-2.7M19.5 12l-2.7 2.7"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="adm-dash">
        <div className="adm-dash-head">
          <div>
            <h1>Manage Blog</h1>
            <p>Write, publish and keep your guides up to date.</p>
          </div>
          <div className="adm-stats">
            <div className="adm-stat">
              <span className="adm-num">{posts.length}</span>
              <span className="adm-cap">Total</span>
            </div>
            <div className="adm-stat">
              <span className="adm-num adm-num-pub">{published}</span>
              <span className="adm-cap">Published</span>
            </div>
            <div className="adm-stat">
              <span className="adm-num adm-num-draft">{drafts}</span>
              <span className="adm-cap">Drafts</span>
            </div>
          </div>
        </div>

        <AdminNotice setup={setup} />

        {error && (
          <div className="adm-err" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 7.5v5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="16.3" r="1.05" fill="currentColor" />
            </svg>
            <span>{error}</span>
            <button type="button" className="adm-err-close" onClick={() => setError("")} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-mark" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M6.5 3.5h7.2L18.5 8.3v12.2H6.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M13.4 3.6v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M9.3 13h6.2M9.3 16.3h4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <h2>No articles yet</h2>
            <p>Your published guides will show up here once you write the first one.</p>
            {setup.database && (
              <Link href="/admin/new/" className="adm-btn adm-btn-primary">
                <PlusIcon />
                Create your first article
              </Link>
            )}
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Updated</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className={busyId === p.id ? "is-busy" : ""}>
                    <td data-label="Title">
                      <Link href={`/admin/edit/${p.id}/`} className="adm-title-link">
                        {p.title}
                      </Link>
                      <div className="adm-slug">/guide/{p.slug}/</div>
                    </td>
                    <td data-label="Status">
                      <span className={`adm-badge adm-badge-${p.status}`}>
                        <span className="adm-dot" aria-hidden="true" />
                        {p.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td data-label="Category">
                      {p.category ? <span className="adm-cat">{p.category}</span> : <span className="adm-muted">—</span>}
                    </td>
                    <td data-label="Updated" className="adm-date">
                      {fmt(p.updated_at)}
                    </td>
                    <td className="adm-row-actions">
                      <div className="adm-actions">
                      {p.status === "published" && (
                        <a
                          href={`/guide/${p.slug}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="adm-act"
                          title="View live article"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M13.8 5.2h5v5M19 5.4 11.6 12.8"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M18 14.4v3.4a1.9 1.9 0 0 1-1.9 1.9H6.4a1.9 1.9 0 0 1-1.9-1.9V8.1a1.9 1.9 0 0 1 1.9-1.9h3.4"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span>View</span>
                        </a>
                      )}
                      <Link href={`/admin/edit/${p.id}/`} className="adm-act" title="Edit article">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="m15.6 4.9 3.5 3.5M4.5 19.5l.8-3.6L16 5.2a1.4 1.4 0 0 1 2 0l.8.8a1.4 1.4 0 0 1 0 2L8.1 18.7z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Edit</span>
                      </Link>
                      <button
                        type="button"
                        className="adm-act adm-act-danger"
                        onClick={() => setConfirmPost(p)}
                        disabled={busyId === p.id}
                        title="Delete article"
                      >
                        <TrashIcon />
                        <span>{busyId === p.id ? "Deleting…" : "Delete"}</span>
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {confirmPost && (
        <div className="adm-overlay" role="dialog" aria-modal="true" aria-labelledby="adm-del-title">
          <div className="adm-modal">
            <div className="adm-modal-mark" aria-hidden="true">
              <TrashIcon size={22} />
            </div>
            <h2 id="adm-del-title">Delete this article?</h2>
            <p>“{confirmPost.title}” will be removed permanently. This action cannot be undone.</p>
            <div className="adm-modal-actions">
              <button
                type="button"
                className="adm-btn adm-btn-ghost"
                onClick={() => setConfirmPost(null)}
                disabled={Boolean(busyId)}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-danger"
                onClick={() => remove(confirmPost)}
                disabled={Boolean(busyId)}
              >
                {busyId ? "Deleting…" : "Delete article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
