"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ACCESS_EMAIL_SUBJECT, accessEmailText, sendAccessEmail } from "@/lib/dashboard/access-email";
import { issueAccessLink, signInWithAccessToken } from "@/lib/dashboard/access-link";
import { ACCESS_TOKEN_FORMAT } from "@/lib/dashboard/access-token";
import { isAdmin, requireAdmin, requireUser } from "@/lib/dashboard/auth";
import { STATUSES, type Status } from "@/lib/dashboard/leads";
import { EMAIL, LIMITS } from "@/lib/leads/validate";
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

const LINK_TYPES = ["invite", "recovery"] as const;
type LinkType = (typeof LINK_TYPES)[number];

/**
 * Second step of invite / password-reset links: only this explicit click verifies the one-time token.
 * Opening the link (GET) never does, so link previews and mail scanners can't use it up.
 */
export async function acceptLink(fd: FormData) {
  const tokenHash = String(fd.get("token_hash") ?? "");
  const type = String(fd.get("type") ?? "");
  if (!/^[a-f0-9]{20,128}$/i.test(tokenHash) || !LINK_TYPES.includes(type as LinkType)) {
    redirect("/dashboard/login?error=link");
  }
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.verifyOtp({ type: type as LinkType, token_hash: tokenHash });
  if (error) redirect("/dashboard/login?error=link");
  redirect("/dashboard/set-password");
}

export type AccessLinkState = FormState & { link?: string; mailto?: string; sent?: boolean };

/** "Generate link": creates the admin account if needed and emails a 7-day, single-use access link (replacing any earlier one). */
export async function sendAccessLink(_: AccessLinkState, fd: FormData): Promise<AccessLinkState> {
  await requireAdmin();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (email.length > LIMITS.email || !EMAIL.test(email)) return { error: "Enter a valid email address." };
  let link: string;
  try {
    link = await issueAccessLink(email, await requestOrigin());
  } catch (e) {
    console.error("[access-link] could not prepare the account", e instanceof Error ? e.message : e);
    return { error: "Couldn't prepare the account. Please try again." };
  }
  const sent = await sendAccessEmail(email, link);
  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(ACCESS_EMAIL_SUBJECT)}&body=${encodeURIComponent(accessEmailText(link))}`;
  return sent
    ? { ok: `Link sent to ${email}.`, link, mailto, sent }
    : { error: "The app can't email this address yet. Copy the link or open it in your mail app.", link, mailto, sent };
}

/** Second step of a dashboard access link: only this explicit click signs the person in. */
export async function acceptAccess(fd: FormData) {
  const token = String(fd.get("t") ?? "");
  if (!ACCESS_TOKEN_FORMAT.test(token) || !(await signInWithAccessToken(token))) {
    redirect("/dashboard/login?error=link");
  }
  redirect("/dashboard/set-password");
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
