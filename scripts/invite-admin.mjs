// Invites an admin to the dashboard (invite email via Supabase → Resend) and sets app_metadata.role.
// Usage: node scripts/invite-admin.mjs email@example.com [site origin, default https://presence-hospitality.vercel.app]
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split("\n").filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const email = process.argv[2];
const origin = process.argv[3] ?? "https://presence-hospitality.vercel.app";
if (!email) throw new Error("email required");
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { data: list } = await admin.auth.admin.listUsers();
const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
let user = existing;
if (existing) {
  console.log("user already exists — resending invite is not possible for confirmed users; use 'Forgot password'.", "confirmed:", Boolean(existing.email_confirmed_at));
} else {
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: `${origin}/dashboard/auth/confirm` });
  if (error) throw new Error("invite failed: " + error.message);
  user = data.user;
  console.log("invite sent to", email);
}
const { data: upd, error: e2 } = await admin.auth.admin.updateUserById(user.id, { app_metadata: { ...user.app_metadata, role: "admin" } });
if (e2) throw new Error("role update failed: " + e2.message);
console.log("role:", upd.user.app_metadata.role, "| invited_at:", upd.user.invited_at ?? "—");
