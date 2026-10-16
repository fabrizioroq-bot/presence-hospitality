// End-to-end: Leads header → Pitch button, "Generate link" → open link → Continue → set password,
// plus single use, tampering and non-admin checks. Cleans up the users it creates.
// Usage: node scripts/e2e-access-link.mjs [baseUrl]
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n").filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const base = process.argv[2] ?? "http://localhost:3000";
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const ts = Date.now();
const pw = randomBytes(18).toString("base64url") + "Aa1";
const inviteeEmail = `e2e-invitee-${ts}@example.com`;
const created = [];
let failed = false;
const check = (label, cond) => { console.log(`${cond ? "PASS" : "FAIL"}  ${label}`); if (!cond) failed = true; };

const signIn = async (page, email, password) => {
  await page.goto(`${base}/dashboard/login`);
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard\/?$/, { timeout: 20000 });
};

const b = await chromium.launch({ channel: "chrome" });
try {
  const { data: a, error } = await admin.auth.admin.createUser({ email: `e2e-admin-${ts}@example.com`, password: pw, email_confirm: true, app_metadata: { role: "admin" } });
  if (error) throw error;
  created.push(a.user.id);

  // 1) Pitch button
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await signIn(page, a.user.email, pw);
  await page.click('a[href="/dashboard/pitch"]');
  await page.waitForURL(/\/dashboard\/pitch/, { timeout: 30000 });
  check("Pitch button opens /dashboard/pitch", page.url().includes("/dashboard/pitch"));

  // 2) Generate link
  await page.goto(`${base}/dashboard`);
  await page.getByRole("button", { name: "Generate link" }).click();
  await page.fill('input[name="email"]', "not-an-email@x");
  await page.getByRole("button", { name: "Send link" }).click();
  const invalid = await page.getByText("Enter a valid email address.").waitFor({ timeout: 20000 }).then(() => true, () => false);
  check("invalid email rejected", invalid);
  await page.fill('input[name="email"]', inviteeEmail);
  await page.getByRole("button", { name: "Send link" }).click();
  await page.waitForSelector('input[aria-label="Access link"]', { timeout: 20000 });
  const firstLink = await page.inputValue('input[aria-label="Access link"]');
  await page.fill('input[name="email"]', inviteeEmail);
  await page.getByRole("button", { name: "Send link" }).click();
  await page.waitForFunction((prev) => document.querySelector('input[aria-label="Access link"]')?.value !== prev, firstLink, { timeout: 20000 });
  const link = await page.inputValue('input[aria-label="Access link"]');
  check("link generated on this host", link.startsWith(`${base}/dashboard/auth/access?t=`));
  check("mail-app fallback offered", (await page.getAttribute('a[href^="mailto:"]', "href"))?.includes(encodeURIComponent(inviteeEmail)));
  await page.screenshot({ path: `${process.env.SHOTS ?? "."}/access-link-panel.png` });
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const invitee = list.users.find((u) => u.email === inviteeEmail);
  if (invitee) created.push(invitee.id);
  check("invitee account created as admin", invitee?.app_metadata?.role === "admin");

  // 3) Tampered link is refused before anything happens
  const anon = await b.newContext();
  const ap = await anon.newPage();
  const tampered = link.replace(/.$/, (c) => (c === "A" ? "B" : "A"));
  await ap.goto(tampered);
  check("tampered link → login error", ap.url().includes("/dashboard/login?error=link"));

  // 3b) A newer link replaces the older one
  await ap.goto(firstLink);
  await ap.getByRole("button", { name: "Continue" }).click();
  await ap.waitForURL(/\/dashboard\/login/, { timeout: 20000 });
  check("older link stops working once a new one is made", ap.url().includes("/dashboard/login?error=link"));

  // 4) Opening the link (as a preview would) changes nothing; Continue signs in
  await ap.goto(link);
  check("link opens the Continue page", ap.url().includes("/dashboard/auth/access"));
  const { data: before } = await admin.auth.admin.getUserById(invitee.id);
  check("opening the link did not sign anyone in", !before.user.last_sign_in_at);
  await ap.getByRole("button", { name: "Continue" }).click();
  await ap.waitForURL(/\/dashboard\/set-password/, { timeout: 20000 });
  check("Continue → set password", ap.url().includes("/dashboard/set-password"));
  await ap.fill("#password", pw);
  await ap.fill("#confirm", pw);
  await ap.click('button[type="submit"]');
  await ap.waitForURL(/\/dashboard\/?$/, { timeout: 20000 });
  check("invitee lands on the dashboard", (await ap.textContent("h1"))?.includes("Leads"));
  await anon.close();

  // 5) Single use
  const again = await b.newContext();
  const gp = await again.newPage();
  await gp.goto(link);
  if (gp.url().includes("/dashboard/auth/access")) {
    await gp.getByRole("button", { name: "Continue" }).click();
    await gp.waitForURL(/\/dashboard\/login/, { timeout: 20000 });
  }
  check("used link → login error", gp.url().includes("/dashboard/login?error=link"));
  await again.close();

  // 6) A non-admin can't call the action through the page
  const { data: plain } = await admin.auth.admin.createUser({ email: `e2e-user-${ts}@example.com`, password: pw, email_confirm: true });
  created.push(plain.user.id);
  const pc = await b.newContext();
  const pp = await pc.newPage();
  await pp.goto(`${base}/dashboard/login`);
  await pp.fill("#email", plain.user.email);
  await pp.fill("#password", pw);
  await pp.click('button[type="submit"]');
  await pp.getByText("doesn't have access").waitFor({ timeout: 20000 });
  check("non-admin can't reach the dashboard", pp.url().includes("/dashboard/login"));
  await pc.close();
  await ctx.close();
} finally {
  await b.close();
  for (const id of created) await admin.auth.admin.deleteUser(id);
  console.log(`cleaned up ${created.length} test users`);
}
process.exit(failed ? 1 : 0);
