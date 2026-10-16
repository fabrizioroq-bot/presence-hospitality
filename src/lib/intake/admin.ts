import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IntakeLang } from "@/content/onboarding-form";
import type { Answers } from "./answers";

/** Dashboard side of the onboarding intake: reads go through the admin's session (RLS: is_admin()). */

export const INVITE_STATUSES = ["sent", "opened", "in_progress", "submitted", "expired", "revoked"] as const;
export type InviteStatus = (typeof INVITE_STATUSES)[number];

export const STATUS_LABEL: Record<InviteStatus, string> = {
  sent: "Sent",
  opened: "Opened",
  in_progress: "In progress",
  submitted: "Submitted",
  expired: "Expired",
  revoked: "Revoked",
};

/** Validity options when creating, extending or regenerating a link. */
export const VALIDITY = [
  { value: "24h", label: "24 hours", hours: 24 },
  { value: "3d", label: "3 days", hours: 72 },
  { value: "7d", label: "7 days", hours: 168 },
  { value: "14d", label: "14 days", hours: 336 },
] as const;
export type Validity = (typeof VALIDITY)[number]["value"];
export const DEFAULT_VALIDITY: Validity = "7d";
export const validityHours = (v: string) => VALIDITY.find((o) => o.value === v)?.hours ?? null;

export type InviteRow = {
  id: string;
  property_name: string;
  contact_email: string | null;
  language: IntakeLang;
  status: InviteStatus;
  expires_at: string;
  created_at: string;
  opened_at: string | null;
  submitted_at: string | null;
  last_activity_at: string | null;
  lead_id: string | null;
  is_test: boolean;
  onboarding_responses: { progress: number; updated_at: string } | null;
};

export type InviteDetail = Omit<InviteRow, "onboarding_responses"> & {
  onboarding_responses: { progress: number; updated_at: string; answers: Answers; submitted_at: string | null } | null;
  leads: { id: string; hotel_name: string } | null;
};

export const INVITE_COLUMNS =
  "id,property_name,contact_email,language,status,expires_at,created_at,opened_at,submitted_at,last_activity_at,lead_id,is_test";

/** What the admin sees: "expired" once the date has passed (unless submitted or revoked). */
export function displayStatus(row: Pick<InviteRow, "status" | "expires_at">, now = Date.now()): InviteStatus {
  if (row.status === "submitted" || row.status === "revoked") return row.status;
  return new Date(row.expires_at).getTime() <= now ? "expired" : row.status;
}

export async function listInvites(supabase: SupabaseClient, opts: { showTest: boolean; leadId?: string; limit?: number }) {
  let q = supabase
    .from("onboarding_invites")
    .select(`${INVITE_COLUMNS},onboarding_responses(progress,updated_at)`)
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 200);
  if (!opts.showTest) q = q.eq("is_test", false);
  if (opts.leadId) q = q.eq("lead_id", opts.leadId);
  const { data, error } = await q.returns<InviteRow[]>();
  return { invites: data ?? [], error };
}

export async function getInvite(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("onboarding_invites")
    .select(`${INVITE_COLUMNS},onboarding_responses(progress,updated_at,answers,submitted_at),leads(id,hotel_name)`)
    .eq("id", id)
    .maybeSingle<InviteDetail>();
  return { invite: data, error };
}

const AMS = "Europe/Amsterdam";
const EXPIRY_PARTS: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: AMS };
const EN_EXPIRY = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: AMS });

/** Link expiry for the client, Amsterdam time: "16 Oct 2026, 14:30" (EN) / "16-10-2026 14:30" (NL). */
export function formatExpiry(iso: string, lang: IntakeLang): string {
  const date = new Date(iso);
  if (lang === "en") return EN_EXPIRY.format(date);
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", EXPIRY_PARTS).formatToParts(date).map((x) => [x.type, x.value]));
  return `${p.day}-${p.month}-${p.year} ${p.hour}:${p.minute}`;
}
