import { redirect } from "next/navigation";
import Dashboard from "@/components/admin/Dashboard";
import { listPostRows } from "@/lib/blog/posts";
import { isAdmin } from "@/lib/blog/session";
import { blogSetup } from "@/lib/blog/setup";
import type { PostRow } from "@/lib/blog/types";

/** /admin/ — every article, drafts included. */
export default async function AdminDashboardPage() {
  if (!(await isAdmin())) redirect("/admin/login/");

  const setup = blogSetup();
  let posts: PostRow[] = [];
  let loadError: string | undefined;
  if (setup.database) {
    try {
      posts = await listPostRows();
    } catch (e) {
      loadError = `Could not load the articles: ${e instanceof Error ? e.message : e}`;
    }
  }

  return <Dashboard initialPosts={posts} setup={setup} loadError={loadError} />;
}
