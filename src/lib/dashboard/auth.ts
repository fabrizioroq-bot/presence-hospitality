import "server-only";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export const isAdmin = (user: User | null) =>
  user?.app_metadata?.role === "admin";

/** Server-side gate for every dashboard page and action (the proxy is only a first filter). */
export async function requireAdmin() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard/login");
  if (!isAdmin(user)) redirect("/dashboard/login?error=forbidden");
  return { supabase, user };
}

/** Signed-in user (admin or not) — used by the set-password step right after an invite link. */
export async function requireUser() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard/login?error=link");
  return { supabase, user };
}
