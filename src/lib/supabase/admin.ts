import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with the secret key (bypasses RLS). Used exclusively to insert
 * leads and for server-side maintenance. Never import this from a client component.
 */
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
