"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, requireAdmin, requireUser } from "@/lib/dashboard/auth";
import { STATUSES, type Status } from "@/lib/dashboard/leads";
import { requestOrigin } from "@/lib/origin";
import { supabaseServer } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: string };

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Email or password is incorrect." };
  if (!isAdmin(data.user)) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have access to the dashboard." };
  }
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/dashboard/login");
}

export async function requestReset(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (email) {
    const supabase = await supabaseServer();
    // The email link comes back to the host the admin used (vercel.app now, the domain later).
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${await requestOrigin()}/dashboard/auth/confirm` });
  }
  // Same answer whether or not the account exists.
  return { ok: "If this email has dashboard access, a reset link is on its way." };
}

const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;

export async function setPassword(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  if (!STRONG.test(password)) return { error: "Use at least 12 characters with upper- and lowercase letters and a number." };
  if (password !== confirm) return { error: "The two passwords don't match." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function updateLead(id: string, _: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const status = String(fd.get("status") ?? "");
  const notes = String(fd.get("notes") ?? "").slice(0, 5000);
  if (!(STATUSES as readonly string[]).includes(status)) return { error: "Unknown status." };
  const { error } = await supabase
    .from("leads")
    .update({ status: status as Status, notes: notes || null })
    .eq("id", id);
  if (error) return { error: "Couldn't save. Please try again." };
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/leads/${id}`);
  return { ok: "Saved" };
}

export async function deleteLead(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error("Delete failed");
  revalidatePath("/dashboard");
  redirect("/dashboard?deleted=1");
}
