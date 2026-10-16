import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { IntakeLang } from "@/content/onboarding-form";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Answers } from "./answers";

/**
 * Onboarding intake links (/intake/<token>). The token is 32 random bytes (base64url, 43 chars);
 * only its SHA-256 is stored. Every read or write goes through here and re-checks the invite.
 */

const TOKEN_BYTES = 32;
export const INTAKE_TOKEN_FORMAT = /^[A-Za-z0-9_-]{43}$/;

export const hashIntakeToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function newIntakeToken() {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  return { token, hash: hashIntakeToken(token) };
}

export type IntakeState = "ok" | "not_found" | "expired" | "revoked" | "submitted";
export type RpcResult = IntakeState | "rate_limited" | "error";

export type LoadedIntake = {
  state: IntakeState;
  language: IntakeLang;
  propertyName: string;
  answers: Answers;
  /** Server copy's last save (ISO), so the browser can tell whether its local draft is newer. */
  updatedAt: string | null;
  submittedAt: string | null;
};

type InviteRow = {
  status: string;
  expires_at: string;
  language: IntakeLang;
  property_name: string;
  submitted_at: string | null;
  onboarding_responses: { answers: Answers; updated_at: string } | null;
};

/** Same rules as public.onboarding_invite_state in the migration. */
function stateOf(row: InviteRow): IntakeState {
  if (row.status === "revoked") return "revoked";
  if (row.status === "submitted") return "submitted";
  if (row.status === "expired" || new Date(row.expires_at).getTime() <= Date.now()) return "expired";
  return "ok";
}

export async function loadIntake(token: string): Promise<LoadedIntake | null> {
  if (!INTAKE_TOKEN_FORMAT.test(token)) return null;
  const { data, error } = await supabaseAdmin()
    .from("onboarding_invites")
    .select("status,expires_at,language,property_name,submitted_at,onboarding_responses(answers,updated_at)")
    .eq("token_hash", hashIntakeToken(token))
    .maybeSingle<InviteRow>();
  if (error) throw new Error(`loading the intake failed: ${error.message}`);
  if (!data) return null;
  return {
    state: stateOf(data),
    language: data.language,
    propertyName: data.property_name,
    answers: data.onboarding_responses?.answers ?? {},
    updatedAt: data.onboarding_responses?.updated_at ?? null,
    submittedAt: data.submitted_at,
  };
}

async function rpc(name: "onboarding_open" | "onboarding_save" | "onboarding_submit", args: Record<string, unknown>): Promise<RpcResult> {
  const { data, error } = await supabaseAdmin().rpc(name, args);
  if (error) {
    console.error(`[intake] ${name} failed`, error.message);
    return "error";
  }
  return data as RpcResult;
}

export const openIntake = (token: string) => rpc("onboarding_open", { p_token_hash: hashIntakeToken(token) });

export const saveIntake = (token: string, answers: Answers, progress: number) =>
  rpc("onboarding_save", { p_token_hash: hashIntakeToken(token), p_answers: answers, p_progress: progress });

export const submitIntake = (token: string, answers: Answers, progress: number) =>
  rpc("onboarding_submit", { p_token_hash: hashIntakeToken(token), p_answers: answers, p_progress: progress });

export type InviteMeta = { id: string; property_name: string; contact_email: string | null; language: IntakeLang; is_test: boolean };

/** Who submitted, for the team notification (read after a successful submit). */
export async function inviteMeta(token: string): Promise<InviteMeta | null> {
  const { data, error } = await supabaseAdmin()
    .from("onboarding_invites")
    .select("id,property_name,contact_email,language,is_test")
    .eq("token_hash", hashIntakeToken(token))
    .maybeSingle<InviteMeta>();
  if (error) console.error("[intake] loading invite meta failed", error.message);
  return data;
}
