// Creates a TEST onboarding intake link (is_test: hidden in the dashboard by default, no submit email).
// Real links are made in the dashboard (/dashboard/onboarding/new).
// Usage: node scripts/intake-invite.mjs "<property>" <en|nl> [days=7] [base=http://localhost:3000] [--expired|--revoked]
//        node scripts/intake-invite.mjs --delete-test   (deletes every test invite and its answers)
import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n").filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const [property, lang = "en", days = "7", base = "http://localhost:3000"] = args.filter((a) => !a.startsWith("--"));

if (flags.has("--delete-test")) {
  const { data, error } = await admin.from("onboarding_invites").delete().eq("is_test", true).select("id");
  if (error) throw error;
  console.log(`deleted ${data.length} test invites`);
  process.exit(0);
}
if (!property || !["en", "nl"].includes(lang)) throw new Error('usage: node scripts/intake-invite.mjs "<property>" <en|nl> [days] [base]');

const token = randomBytes(32).toString("base64url");
const hash = createHash("sha256").update(token).digest("hex");
const expires = flags.has("--expired") ? new Date(Date.now() - 60_000) : new Date(Date.now() + Number(days) * 86_400_000);
const { error } = await admin.from("onboarding_invites").insert({
  token_hash: hash,
  property_name: property,
  language: lang,
  expires_at: expires.toISOString(),
  status: flags.has("--revoked") ? "revoked" : "sent",
  is_test: true,
});
if (error) throw error;
console.log(`${base}/intake/${token}`);
