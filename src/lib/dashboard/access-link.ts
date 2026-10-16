import "server-only";
import { randomBytes } from "node:crypto";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { signAccessToken, verifyAccessToken } from "./access-token";

/**
 * Dashboard access links made in the dashboard ("Generate link").
 *
 * Supabase's own invite links expire after the project's email OTP lifetime (often before the person
 * opens them). These links carry our own signed token instead, valid for ACCESS_LINK_DAYS; the Supabase
 * one-time token is created and used in the same request, when the person presses "Continue".
 */

// Keyed off the service-role key (server-only, already set everywhere); rotating it voids open links.
function secret() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Supabase server credentials are not configured");
  return key;
}

const PAGE_SIZE = 1000;
const NONCE_BYTES = 18;

async function findUser(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin().auth.admin.listUsers({ perPage: PAGE_SIZE });
  if (error) throw new Error(`listUsers failed: ${error.message}`);
  return data.users.find((u) => u.email?.toLowerCase() === email) ?? null;
}

/**
 * Creates (or promotes) the admin account for this email and returns a fresh access link.
 * Storing a new nonce on the account voids any earlier link for the same person.
 */
export async function issueAccessLink(email: string, origin: string): Promise<string> {
  const admin = supabaseAdmin().auth.admin;
  const nonce = randomBytes(NONCE_BYTES).toString("base64url");
  const existing = await findUser(email);
  const { data, error } = existing
    ? await admin.updateUserById(existing.id, {
        app_metadata: { ...existing.app_metadata, role: "admin", access_nonce: nonce },
      })
    : await admin.createUser({ email, app_metadata: { role: "admin", access_nonce: nonce } });
  if (error || !data.user) throw new Error(`saving the account failed: ${error?.message}`);
  const token = signAccessToken({ userId: data.user.id, nonce }, secret());
  return `${origin}/dashboard/auth/access?t=${token}`;
}

/** Signature and expiry only (no side effects): lets the landing page turn away dead links early. */
export const isLiveAccessToken = (token: string) => verifyAccessToken(token, secret()) !== null;

/**
 * Signs the person in from an access link. False when the link is forged, expired, already used,
 * replaced by a newer link, or Supabase refuses.
 */
export async function signInWithAccessToken(token: string): Promise<boolean> {
  const claims = verifyAccessToken(token, secret());
  if (!claims) return false;
  const admin = supabaseAdmin().auth.admin;
  const { data: found, error: findError } = await admin.getUserById(claims.userId);
  const user = found?.user;
  if (findError || !user?.email || user.app_metadata?.access_nonce !== claims.nonce) return false;

  // Use the link up before creating the session, so a second click (or copy) can't sign in again.
  const { error: burnError } = await admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, access_nonce: null },
  });
  if (burnError) {
    console.error("[access-link] clearing the nonce failed", burnError.message);
    return false;
  }

  // A recovery token also confirms an invited, never-confirmed email.
  const { data: link, error: linkError } = await admin.generateLink({ type: "recovery", email: user.email });
  if (linkError || !link.properties?.hashed_token) {
    console.error("[access-link] generateLink failed", linkError?.message);
    return false;
  }
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: link.properties.hashed_token });
  if (error) console.error("[access-link] verifyOtp failed", error.message);
  return !error;
}
