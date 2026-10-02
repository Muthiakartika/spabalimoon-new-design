import { createHash, timingSafeEqual } from "node:crypto";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

/**
 * Admin login: one shared password (ADMIN_PASSWORD) and an encrypted cookie
 * (iron-session, sealed with SESSION_SECRET), as on the live site.
 */

type AdminSession = { isAdmin?: boolean };

// Development only: production refuses to run without a real SESSION_SECRET.
const DEV_SECRET = "dev-only-insecure-secret-change-me-please-32";

/** The cookie key, or null in production when SESSION_SECRET is missing or shorter than 32 characters. */
function sessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  return process.env.NODE_ENV === "production" ? null : DEV_SECRET;
}

function sessionOptions(password: string): SessionOptions {
  return {
    password,
    cookieName: "sbm_admin_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    },
  };
}

/** Why logging in cannot work on this server, or null when it can. */
export function loginUnavailable(): string | null {
  if (!process.env.ADMIN_PASSWORD) return "ADMIN_PASSWORD is not set on the server.";
  if (!sessionSecret()) return "SESSION_SECRET is not set on the server (at least 32 characters).";
  return null;
}

async function getSession() {
  const secret = sessionSecret();
  if (!secret) return null;
  return getIronSession<AdminSession>(await cookies(), sessionOptions(secret));
}

/** Is the visitor logged in to the admin? */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session?.isAdmin);
}

/** Compare against ADMIN_PASSWORD in constant time. */
export function passwordMatches(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(password), digest(expected));
}

/** Mark this browser as logged in (route handlers only: it sets the cookie). */
export async function startAdminSession(): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("SESSION_SECRET is not set on the server.");
  session.isAdmin = true;
  await session.save();
}

export async function endAdminSession(): Promise<void> {
  const session = await getSession();
  session?.destroy();
}

/** For admin route handlers: a 401 response for anyone not logged in, otherwise null. */
export async function denyUnlessAdmin(): Promise<Response | null> {
  return (await isAdmin()) ? null : Response.json({ error: "Unauthorized" }, { status: 401 });
}
