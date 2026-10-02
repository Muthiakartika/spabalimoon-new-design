import { endAdminSession } from "@/lib/blog/session";

/** POST — log out of the blog admin. */
export async function POST() {
  await endAdminSession();
  return Response.json({ ok: true });
}
