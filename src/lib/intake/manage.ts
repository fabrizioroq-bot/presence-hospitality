import "server-only";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { site } from "@/content/site";
import type { IntakeLang } from "@/content/onboarding-form";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_VALIDITY, formatExpiry, validityHours } from "@/lib/intake/admin";
import { fill } from "@/lib/intake/format";
import { newIntakeToken } from "@/lib/intake/invites";
import { EMAIL, LIMITS } from "@/lib/leads/validate";
import { requestOrigin } from "@/lib/origin";

// Admin operations on onboarding links, called by the route handler /dashboard/onboarding/manage after
// it checked the admin session (RLS: is_admin() checks again). Not server actions on purpose: client
// components referencing new server actions regrouped the public demo page's chunks (+8 KB on
// /en/demo, measured 16-10); the dashboard calls this with fetch instead.

/** Plain form fields (the client sends its form as JSON). */
export type Fields = Readonly<Record<string, string>>;

export type Shareable = { link: string; message: string; lang: IntakeLang };
export type InviteFormState = { error?: string; ok?: string; id?: string; share?: Shareable };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HOUR_MS = 3_600_000;
const PROPERTY_MAX = 120;
const REOPEN_HOURS = 168;

/** The link (shown once: only its hash is stored) and the prefilled message in the invite's language. */
async function shareable(token: string, property: string, lang: IntakeLang, expiresAt: string): Promise<Shareable> {
  const link = `${await requestOrigin()}/intake/${token}`;
  const t = await getTranslations({ locale: lang, namespace: "intake" });
  const message = fill(t.raw("inviteMessage") as string, {
    property,
    link,
    expires: formatExpiry(expiresAt, lang),
    email: site.email,
  });
  return { link, message, lang };
}

function refresh(id?: string) {
  revalidatePath("/dashboard/onboarding");
  if (id) revalidatePath(`/dashboard/onboarding/${id}`);
}

export async function createInvite(supabase: SupabaseClient, userId: string, fd: Fields): Promise<InviteFormState> {
  const property = (fd.property ?? "").trim();
  const email = (fd.email ?? "").trim().toLowerCase();
  const lang = fd.language ?? "";
  const hours = validityHours(fd.validity ?? DEFAULT_VALIDITY);
  const leadId = fd.lead ?? "";
  const isTest = fd.test === "on";

  if (!property || property.length > PROPERTY_MAX) return { error: "Enter the property name (max. 120 characters)." };
  if (email && (email.length > LIMITS.email || !EMAIL.test(email))) return { error: "Enter a valid email address, or leave it empty." };
  if (lang !== "en" && lang !== "nl") return { error: "Choose the form language." };
  if (!hours) return { error: "Choose how long the link stays valid." };
  if (leadId && !UUID.test(leadId)) return { error: "Unknown lead." };

  const { token, hash } = newIntakeToken();
  const expiresAt = new Date(Date.now() + hours * HOUR_MS).toISOString();
  const { data, error } = await supabase
    .from("onboarding_invites")
    .insert({
      token_hash: hash,
      property_name: property,
      contact_email: email || null,
      language: lang,
      expires_at: expiresAt,
      lead_id: leadId || null,
      created_by: userId,
      is_test: isTest,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[onboarding] create failed", error?.message);
    return { error: "Couldn't create the link. Please try again." };
  }
  refresh();
  if (leadId) revalidatePath(`/dashboard/leads/${leadId}`);
  return { id: data.id, share: await shareable(token, property, lang, expiresAt) };
}

type InviteForUpdate = {
  id: string;
  property_name: string;
  language: IntakeLang;
  status: string;
  expires_at: string;
  onboarding_responses: { id: string } | null;
};

async function loadForUpdate(supabase: SupabaseClient, id: string) {
  if (!UUID.test(id)) return null;
  const { data } = await supabase
    .from("onboarding_invites")
    .select("id,property_name,language,status,expires_at,onboarding_responses(id)")
    .eq("id", id)
    .maybeSingle<InviteForUpdate>();
  return data ? { invite: data } : null;
}

/** Adds the chosen validity, counted from now or from the current expiry if that is later. */
export async function extendInvite(supabase: SupabaseClient, id: string, fd: Fields): Promise<InviteFormState> {
  const found = await loadForUpdate(supabase, id);
  const hours = validityHours(fd.validity ?? DEFAULT_VALIDITY);
  if (!found || !hours) return { error: "Couldn't extend the link." };
  const from = Math.max(Date.now(), new Date(found.invite.expires_at).getTime());
  const { error } = await supabase
    .from("onboarding_invites")
    .update({ expires_at: new Date(from + hours * HOUR_MS).toISOString() })
    .eq("id", id);
  if (error) return { error: "Couldn't extend the link." };
  refresh(id);
  return { ok: "Link extended." };
}

export async function revokeInvite(supabase: SupabaseClient, id: string): Promise<InviteFormState> {
  const found = await loadForUpdate(supabase, id);
  if (!found) return { error: "Couldn't revoke the link." };
  const { error } = await supabase.from("onboarding_invites").update({ status: "revoked" }).eq("id", id);
  if (error) return { error: "Couldn't revoke the link." };
  refresh(id);
  return { ok: "Link revoked. The client now sees a 'no longer active' page." };
}

/** Lets the client edit a submitted (or revoked) form again; an expired date is pushed 7 days ahead. */
export async function reopenInvite(supabase: SupabaseClient, id: string): Promise<InviteFormState> {
  const found = await loadForUpdate(supabase, id);
  if (!found) return { error: "Couldn't reopen the form." };
  const { invite } = found;
  const hasAnswers = Boolean(invite.onboarding_responses);
  const isExpired = new Date(invite.expires_at).getTime() <= Date.now();
  const { error } = await supabase
    .from("onboarding_invites")
    .update({
      status: hasAnswers ? "in_progress" : "sent",
      submitted_at: null,
      ...(isExpired ? { expires_at: new Date(Date.now() + REOPEN_HOURS * HOUR_MS).toISOString() } : {}),
    })
    .eq("id", id);
  if (error) return { error: "Couldn't reopen the form." };
  if (hasAnswers) {
    const { error: respError } = await supabase.from("onboarding_responses").update({ submitted_at: null }).eq("invite_id", id);
    if (respError) console.error("[onboarding] reopen: response not updated", respError.message);
  }
  refresh(id);
  return { ok: "Form reopened: the client can edit it again with the same link." };
}

/** New token (the old link stops working) with a fresh validity; answers are kept. */
export async function regenerateInvite(supabase: SupabaseClient, id: string, fd: Fields): Promise<InviteFormState> {
  const found = await loadForUpdate(supabase, id);
  const hours = validityHours(fd.validity ?? DEFAULT_VALIDITY);
  if (!found || !hours) return { error: "Couldn't create a new link." };
  const { invite } = found;
  const { token, hash } = newIntakeToken();
  const expiresAt = new Date(Date.now() + hours * HOUR_MS).toISOString();
  const status = invite.status === "revoked" ? (invite.onboarding_responses ? "in_progress" : "sent") : invite.status;
  const { error } = await supabase
    .from("onboarding_invites")
    .update({ token_hash: hash, expires_at: expiresAt, status })
    .eq("id", id);
  if (error) return { error: "Couldn't create a new link." };
  refresh(id);
  return {
    ok: "New link created. The previous link no longer works.",
    share: await shareable(token, invite.property_name, invite.language, expiresAt),
  };
}
