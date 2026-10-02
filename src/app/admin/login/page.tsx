import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/blog/session";

export const metadata: Metadata = { title: { absolute: "Admin Login" } };

/** /admin/login/ — already logged in goes straight to the dashboard. */
export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin/");
  return <LoginForm />;
}
