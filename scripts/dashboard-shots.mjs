// Screenshots of authenticated dashboard pages (UI kit, pitch) as a temporary admin, plus any console
// errors. The admin user is created with the service role key and always deleted afterwards.
// Usage: node scripts/dashboard-shots.mjs <baseUrl> <out-dir> <path> [path…]
//   e.g. node scripts/dashboard-shots.mjs http://localhost:3000 screenshots/ui-kit /dashboard/ui-kit
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const [base, out, ...paths] = process.argv.slice(2);
if (!base || !out || !paths.length) throw new Error("usage: dashboard-shots.mjs <baseUrl> <out-dir> <path> [path…]");
mkdirSync(out, { recursive: true });

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env.local");
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const email = `e2e-shots-${Date.now()}@example.com`;
const password = randomBytes(18).toString("base64url") + "Aa1";
const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: "admin" } });
if (error) throw error;

const b = await chromium.launch({ channel: "chrome" });
let failed = false;
try {
  const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${base}/dashboard/login`);
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${base}/dashboard`);
  for (const path of paths) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const name = path.replace(/^\/dashboard\/?/, "").replace(/[^a-z0-9]+/gi, "-") || "dashboard";
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    console.log(`shot  ${path} → ${out}/${name}.png`);
  }
  if (errors.length) {
    failed = true;
    console.error("Console errors:\n  " + errors.join("\n  "));
  } else console.log("No console errors.");
} finally {
  await b.close();
  await admin.auth.admin.deleteUser(data.user.id);
}
if (failed) process.exit(1);
