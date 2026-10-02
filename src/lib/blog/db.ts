import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * The blog database: a Neon Postgres project, reached over HTTPS with the Neon
 * serverless driver. DATABASE_URL is the project's connection string (Neon
 * console -> Connect). Server code only: route handlers and server
 * components. The variable has no NEXT_PUBLIC_ prefix, so it never reaches the
 * browser, and it is read when the server runs, not frozen into the build.
 */

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let client: NeonQueryFunction<false, false> | null = null;

/** The tagged-template query function: sql`SELECT … WHERE id = ${id}` (values are sent as parameters). */
export function getSql(): NeonQueryFunction<false, false> {
  if (!isDatabaseConfigured()) throw new Error("The blog database is not configured: set DATABASE_URL.");
  client ??= neon(process.env.DATABASE_URL!);
  return client;
}

/**
 * A timestamptz as the live site's Supabase API wrote it, e.g.
 * "2026-06-24T08:57:11+00:00" or "2026-09-13T13:22:37.272+00:00": UTC, no
 * trailing zeros in the fraction. The article pages print published_at into
 * <time dateTime>, so the spelling has to stay the same.
 */
export function toTimestamp(value: unknown): string | null {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date
    .toISOString()
    .replace(/(\.\d*?)0*Z$/, "$1Z")
    .replace(/\.Z$/, "Z")
    .replace(/Z$/, "+00:00");
}
