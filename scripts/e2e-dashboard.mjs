// End-to-end: form → Supabase → dashboard (list, detail, status, CSV) → delete. Cleans up after itself.
// Usage: node scripts/e2e-dashboard.mjs [baseUrl]
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
const hotel = `E2E Test Hotel ${ts}`;
const pw = randomBytes(18).toString("base64url") + "Aa1";
const users = [];
const ok = (label, cond) => console.log(`${cond ? "PASS" : "FAIL"}  ${label}`);
let failed = false;
const check = (label, cond) => { ok(label, cond); if (!cond) failed = true; };

const mkUser = async (email, role) => {
  const { data, error } = await admin.auth.admin.createUser({ email, password: pw, email_confirm: true, app_metadata: role ? { role } : {} });
  if (error) throw error;
  users.push(data.user.id);
  return data.user;
};

const b = await chromium.launch({ channel: "chrome" });
try {
  const adminUser = await mkUser(`e2e-admin-${ts}@example.com`, "admin");
  const plainUser = await mkUser(`e2e-user-${ts}@example.com`, null);

  // 1) Submit a lead through the public form
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${base}/nl/demo`, { waitUntil: "networkidle" });
  await page.locator("#demo").scrollIntoViewIfNeeded();
  await page.fill("#demo-first_name", "E2E");
  await page.fill("#demo-last_name", "Tester");
  await page.fill("#demo-email", `e2e.${ts}@example.com`);
  await page.fill("#demo-phone", "+31 6 1234 5678");
  await page.selectOption("#demo-position", "owner");
  await page.fill("#demo-hotel_name", hotel);
  await page.fill("#demo-description", "Automated end-to-end test lead. Deleted at the end of the test.");
  await page.check("#demo-consent");
  await page.waitForTimeout(3200);
  await page.click('#demo button[type="submit"]');
  await page.waitForSelector("#demo .success-title", { timeout: 15000 });
  const { data: rows } = await admin.from("leads").select("id,language,status,source,gdpr_consent").eq("hotel_name", hotel);
  check("form submission stored in Supabase (language=nl, status=new, source=website)", rows?.length === 1 && rows[0].language === "nl" && rows[0].status === "new" && rows[0].source === "website");
  const leadId = rows?.[0]?.id;

  // 2) Unauthenticated access is redirected to login
  const anon = await b.newContext();
  const ap = await anon.newPage();
  await ap.goto(`${base}/dashboard`);
  check("unauthenticated /dashboard → login", ap.url().includes("/dashboard/login"));
  const exp = await ap.request.get(`${base}/dashboard/export`, { maxRedirects: 0 });
  check("unauthenticated CSV export blocked", exp.status() === 307 || exp.status() === 403);
  await anon.close();

  // 3) Non-admin user: app denies, database denies
  const np = await (await b.newContext()).newPage();
  await np.goto(`${base}/dashboard/login`);
  await np.fill("#email", plainUser.email);
  await np.fill("#password", pw);
  await np.click('button[type="submit"]');
  await np.waitForSelector('form [role="alert"]');
  check("non-admin sign-in refused", (await np.locator('form [role="alert"]').innerText()).includes("doesn't have access"));
  const userClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  await userClient.auth.signInWithPassword({ email: plainUser.email, password: pw });
  const { data: seen } = await userClient.from("leads").select("id");
  check("non-admin sees 0 rows via the API (RLS)", (seen ?? []).length === 0);
  const { error: insErr } = await userClient.from("leads").insert({ first_name: "x" });
  check("non-admin cannot insert via the API", Boolean(insErr));

  // 4) Admin: sign in, find the lead, open it
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await ctx.newPage();
  await dp.goto(`${base}/dashboard/login`);
  await dp.fill("#email", adminUser.email);
  await dp.fill("#password", pw);
  await dp.click('button[type="submit"]');
  await dp.waitForURL(`${base}/dashboard`);
  await dp.goto(`${base}/dashboard?q=${encodeURIComponent(hotel)}`);
  check("lead appears in the dashboard list (search)", (await dp.locator(`text=${hotel}`).count()) > 0);
  await dp.screenshot({ path: "screenshots/phase-10/dashboard-list.png", fullPage: true });
  await dp.click(`a:has-text("${hotel}")`);
  await dp.waitForURL(/\/dashboard\/leads\//);

  // 5) Change status + notes
  await dp.selectOption('select[name="status"]', "contacted");
  await dp.fill('textarea[name="notes"]', "Called, demo next week.");
  await dp.click('button:has-text("Save changes")');
  await dp.waitForSelector("text=✓ Saved");
  const { data: after } = await admin.from("leads").select("status,notes,status_updated_at").eq("id", leadId).single();
  check("status + notes saved (status_updated_at set)", after?.status === "contacted" && after?.notes === "Called, demo next week." && Boolean(after?.status_updated_at));
  await dp.reload();
  await dp.screenshot({ path: "screenshots/phase-10/dashboard-detail.png", fullPage: true });

  // 6) CSV export (filtered)
  const csv = await dp.request.get(`${base}/dashboard/export?q=${encodeURIComponent(hotel)}`);
  const body = await csv.text();
  check("CSV export contains the lead", csv.ok() && body.includes(hotel) && body.split("\r\n").length === 2);

  // 7) Delete via dashboard
  await dp.click('button:has-text("Delete lead")');
  await dp.click('button:has-text("Delete permanently")');
  await dp.waitForURL(/deleted=1/);
  const { data: gone } = await admin.from("leads").select("id").eq("id", leadId);
  check("lead deleted from the dashboard", (gone ?? []).length === 0);
} catch (e) {
  failed = true;
  console.error("ERROR", e.message);
} finally {
  await b.close();
  await admin.from("leads").delete().like("hotel_name", "E2E Test Hotel%");
  for (const id of users) await admin.auth.admin.deleteUser(id);
  const { data: left } = await admin.from("leads").select("id");
  const { data: list } = await admin.auth.admin.listUsers();
  console.log(`cleanup → leads left: ${left?.length ?? "?"}, temp users left: ${list?.users.filter((u) => u.email?.startsWith("e2e-")).length ?? "?"}`);
  process.exit(failed ? 1 : 0);
}
