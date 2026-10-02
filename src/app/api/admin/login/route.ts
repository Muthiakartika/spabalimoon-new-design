import { loginUnavailable, passwordMatches, startAdminSession } from "@/lib/blog/session";

/** POST { password } — log in to the blog admin. */
export async function POST(request: Request) {
  const problem = loginUnavailable();
  if (problem) return Response.json({ error: problem }, { status: 500 });

  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (!passwordMatches(password)) return Response.json({ error: "Incorrect password." }, { status: 401 });

  await startAdminSession();
  return Response.json({ ok: true });
}
