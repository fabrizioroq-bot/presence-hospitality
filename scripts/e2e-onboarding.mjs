// End-to-end: client onboarding intake (/intake/<token>) and its dashboard section.
// Creates its own temporary admin, lead and TEST invites (is_test) and deletes exactly those at the end.
// Usage: node scripts/e2e-onboarding.mjs [baseUrl=http://localhost:3000]
// The last check fills this machine's per-IP limit on /api/intake (120/min): wait a minute between runs.
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n").filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const base = process.argv[2] ?? "http://localhost:3000";
const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const run = `TEST e2e ${Date.now()}`;
const pw = randomBytes(18).toString("base64url") + "Aa1";
let failed = false;
const check = (label, cond) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}`);
  if (!cond) failed = true;
};

/** A test invite straight in the database (for states the UI can't create quickly: expired). */
async function seedInvite(name, lang, { expired = false, revoked = false, submittedAnswers = null } = {}) {
  const token = randomBytes(32).toString("base64url");
  const { data, error } = await db.from("onboarding_invites").insert({
    token_hash: createHash("sha256").update(token).digest("hex"),
    property_name: `${run} ${name}`,
    language: lang,
    expires_at: new Date(Date.now() + (expired ? -60_000 : 7 * 86_400_000)).toISOString(),
    status: revoked ? "revoked" : submittedAnswers ? "submitted" : "sent",
    submitted_at: submittedAnswers ? new Date().toISOString() : null,
    is_test: true,
  }).select("id").single();
  if (error) throw error;
  if (submittedAnswers) await db.from("onboarding_responses").insert({ invite_id: data.id, answers: submittedAnswers, progress: 5, submitted_at: new Date().toISOString() });
  return `${base}/intake/${token}`;
}

/** Waits until the autosave has written this page's answers to the server (local draft marked synced). */
const synced = (page) =>
  page.waitForFunction(
    () => Object.keys(localStorage).some((k) => k.startsWith("ph-intake:") && JSON.parse(localStorage.getItem(k)).synced),
    null,
    { timeout: 20000 },
  );
const settle = async (page) => {
  await page.waitForTimeout(150);
  await synced(page);
};
const statusText = (page) => page.textContent("header [aria-live]");
const h1 = (page) => page.textContent("h1");

const { data: adminUser, error: userError } = await db.auth.admin.createUser({
  email: `e2e-onboarding-${Date.now()}@example.com`,
  password: pw,
  email_confirm: true,
  app_metadata: { role: "admin" },
});
if (userError) throw userError;
const { data: lead, error: leadError } = await db
  .from("leads")
  .insert({
    first_name: "E2E",
    last_name: "Onboarding",
    email: "e2e.onboarding@example.com",
    phone: "+31 20 000 0000",
    position: "owner",
    hotel_name: `${run} Hotel`,
    description: "Automated onboarding test lead. Deleted at the end of the test.",
    language: "nl",
    gdpr_consent: true,
  })
  .select("id,hotel_name")
  .single();
if (leadError) throw leadError;

const b = await chromium.launch({ channel: "chrome" });
try {
  // ---- Dashboard: new link from a lead ---------------------------------------------------------
  const adminCtx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const dash = await adminCtx.newPage();
  await dash.goto(`${base}/dashboard/login`);
  await dash.fill("#email", adminUser.user.email);
  await dash.fill("#password", pw);
  await dash.click('button[type="submit"]');
  await dash.waitForURL(/\/dashboard\/?$/);

  await dash.goto(`${base}/dashboard/onboarding/new?lead=${lead.id}`);
  check("new link: the lead prefills property and language", (await dash.inputValue('input[name="property"]')) === lead.hotel_name && (await dash.inputValue('select[name="language"]')) === "nl");
  await dash.selectOption('select[name="validity"]', "3d");
  await dash.check('input[name="test"]');
  await dash.getByRole("button", { name: "Create link" }).click();
  await dash.waitForSelector("#share-link");
  const link = await dash.inputValue("#share-link");
  check("new link: link + Dutch message shown once", link.startsWith(`${base}/intake/`) && (await dash.inputValue("#share-message")).includes(link));
  const { data: invite } = await db.from("onboarding_invites").select("id,is_test,lead_id,status").eq("property_name", lead.hotel_name).single();
  check("new link: stored as a test invite, linked to the lead", invite?.is_test === true && invite.lead_id === lead.id && invite.status === "sent");

  await dash.goto(`${base}/dashboard/onboarding`);
  const hiddenByDefault = !(await dash.isVisible(`text=${lead.hotel_name}`));
  await dash.goto(`${base}/dashboard/onboarding?test=1`);
  check("list: test links hidden by default, shown with the toggle", hiddenByDefault && (await dash.isVisible(`text=${lead.hotel_name}`)));

  // ---- Client: fill partially, reload, answers still there, then submit -------------------------
  const clientCtx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const client = await clientCtx.newPage();
  const errors = [];
  client.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await client.goto(link, { waitUntil: "networkidle" });
  check("form: opens in the invite's language with today's date (dd-mm-yyyy)", (await h1(client))?.startsWith("KLANTONBOARDING") && /^\d{2}-\d{2}-\d{4}$/.test((await client.textContent(".intake-date > div"))?.trim() ?? ""));
  await client.fill("#f-id-property_name", lead.hotel_name);
  await client.fill("#f-id-contact_name", "E2E Persoon");
  await settle(client);
  await client.getByRole("button", { name: "3. ALGEMENE GEGEVENS" }).click();
  await client.fill("#f-s03-rooms", "84");
  await client.locator('label:has(input[name="s03.reception_present"][value="yes"])').click();
  await settle(client);
  const { data: opened } = await db.from("onboarding_invites").select("status,opened_at").eq("id", invite.id).single();
  check("form: invite marked in progress once the browser saves", opened.status === "in_progress" && Boolean(opened.opened_at));

  await client.evaluate(() => localStorage.clear()); // prove the answers come from the server, not the draft
  await client.reload({ waitUntil: "networkidle" });
  await client.getByRole("button", { name: "3. ALGEMENE GEGEVENS" }).click();
  check("reload: answers come back from the server", (await client.inputValue("#f-s03-rooms")) === "84" && (await client.locator('input[name="s03.reception_present"][value="yes"]').isChecked()));
  await client.getByRole("button", { name: "Start", exact: true }).first().click();
  check("reload: identification kept", (await client.inputValue("#f-id-contact_name")) === "E2E Persoon");

  // Offline: kept locally, synced when the connection returns
  await clientCtx.setOffline(true);
  await client.fill("#f-id-role", "GM");
  await client.waitForFunction(() => document.querySelector("header [aria-live]")?.textContent?.includes("Offline"), null, { timeout: 10000 });
  check("offline: status says it will retry", (await statusText(client))?.includes("Offline"));
  await clientCtx.setOffline(false);
  await client.evaluate(() => window.dispatchEvent(new Event("online")));
  await settle(client);
  const { data: afterOffline } = await db.from("onboarding_responses").select("answers").eq("invite_id", invite.id).single();
  check("offline: change reaches the server after reconnecting", afterOffline.answers["id.role"] === "GM");

  // Submit: identification required, then confirmation
  await client.getByRole("button", { name: "Controleren & versturen" }).click();
  check("review: missing identification blocks submitting", await client.locator('[role="alert"]', { hasText: "Vul deze gegevens in" }).isVisible());
  for (const [id, v] of [["email", "e2e.onboarding@example.com"], ["phone", "+31 20 000 0000"], ["address", "Teststraat 1, Amsterdam"]]) {
    await client.getByRole("button", { name: "Start", exact: true }).first().click();
    await client.fill(`#f-id-${id}`, v);
  }
  await settle(client);
  await client.getByRole("button", { name: "Controleren & versturen" }).click();
  await client.getByRole("button", { name: "Versturen", exact: true }).click();
  await client.getByRole("button", { name: "Ja, versturen" }).click();
  await client.waitForSelector("h1:has-text('Bedankt')", { timeout: 20000 });
  check("submit: thank-you page with a read-only summary", (await client.locator("input, textarea").count()) === 0 && (await client.locator("dd", { hasText: "84" }).count()) === 1);
  check("form: no console errors", errors.length === 0 || (console.log(errors), false));

  // ---- Dashboard: detail, exports, print, lead link -------------------------------------------
  await dash.goto(`${base}/dashboard/onboarding/${invite.id}`);
  check("detail: submitted, answers shown in English", (await dash.isVisible("text=Submitted")) && (await dash.locator("div:has(> dt:text-is('Reception present?')) > dd").textContent()) === "Yes");
  const csv = await dash.request.get(`${base}/dashboard/onboarding/${invite.id}/export?format=csv`);
  check("export: CSV", csv.status() === 200 && (await csv.text()).includes('"Number of rooms / keys","s03.rooms","84"'));
  const json = await (await dash.request.get(`${base}/dashboard/onboarding/${invite.id}/export?format=json`)).json();
  check("export: JSON", json.answers["s03.rooms"] === "84" && json.status === "submitted" && json.questions.length === 186);
  await dash.goto(`${base}/dashboard/onboarding/${invite.id}/print`);
  check("print view", (await h1(dash)) === lead.hotel_name);
  await dash.goto(`${base}/dashboard/leads/${lead.id}`);
  check("lead detail lists the onboarding", await dash.isVisible(`text=${lead.hotel_name} (test)`));

  // Reopen, new link, extend, revoke
  await dash.goto(`${base}/dashboard/onboarding/${invite.id}`);
  await dash.getByRole("button", { name: "Reopen for editing" }).click();
  await dash.waitForSelector("text=Form reopened");
  await client.reload({ waitUntil: "networkidle" });
  check("reopen: the client can edit again", (await client.inputValue("#f-id-property_name")) === lead.hotel_name);
  await dash.getByRole("button", { name: "Create new link" }).click();
  await dash.waitForSelector("#share-link");
  const link2 = await dash.inputValue("#share-link");
  await client.goto(link);
  // An unknown token has no language of its own: the invalid page is in English.
  check("new link: the old link stops working", (await h1(client)) === "This link isn't valid");
  await client.goto(link2, { waitUntil: "networkidle" });
  check("new link: opens the form with the answers", (await client.inputValue("#f-id-property_name")) === lead.hotel_name);
  await dash.reload();
  const before = (await db.from("onboarding_invites").select("expires_at").eq("id", invite.id).single()).data.expires_at;
  await dash.getByRole("button", { name: "Extend", exact: true }).click();
  await dash.waitForSelector("text=Link extended");
  const after = (await db.from("onboarding_invites").select("expires_at").eq("id", invite.id).single()).data.expires_at;
  check("extend: expiry moves forward", new Date(after) > new Date(before));
  await dash.getByRole("button", { name: "Revoke link" }).click();
  await dash.getByRole("button", { name: "Revoke", exact: true }).click();
  await dash.waitForSelector("text=Link revoked");
  await client.goto(link2);
  check("revoke: the client sees 'no longer active'", (await h1(client)) === "Deze link is niet meer actief");

  // ---- Expired / revoked / invalid links (EN) ---------------------------------------------------
  const anon = await b.newPage();
  await anon.goto(await seedInvite("Expired", "en", { expired: true }));
  check("expired link: friendly page with our address", (await h1(anon)) === "This link has expired" && (await anon.isVisible("a[href='mailto:info@presence-hospitality.com']")));
  await anon.goto(await seedInvite("Revoked", "en", { revoked: true }));
  check("revoked link: friendly page", (await h1(anon)) === "This link is no longer active");
  await anon.goto(await seedInvite("Submitted expired", "en", { expired: true, submittedAnswers: { "id.property_name": "Secret Hotel" } }));
  check("submitted + expired link: thank-you only, answers hidden", (await h1(anon)) === "Thank you" && !(await anon.isVisible("text=Secret Hotel")));
  await anon.goto(`${base}/intake/${randomBytes(32).toString("base64url")}`);
  check("unknown link: friendly page", (await h1(anon)) === "This link isn't valid");
  const headers = (await anon.request.get(`${base}/intake/x`)).headers();
  check("intake: noindex + no-referrer", headers["x-robots-tag"]?.includes("noindex") && headers["referrer-policy"] === "no-referrer");

  // ---- Autosave rate limit: 429 → "Saving…", silent back-off, answers still arrive --------------
  const rl = await (await b.newContext()).newPage();
  let forced = 0;
  await rl.route("**/api/intake", (route) => {
    if (route.request().postDataJSON().action === "save" && forced < 2) {
      forced++;
      return route.fulfill({ status: 429, contentType: "application/json", body: '{"status":"rate_limited"}' });
    }
    return route.continue();
  });
  const rlLink = await seedInvite("Backoff", "en");
  await rl.goto(rlLink, { waitUntil: "networkidle" });
  await rl.fill("#f-id-property_name", "Back-off check");
  await rl.waitForTimeout(1500);
  const shown = (await statusText(rl)) ?? "";
  await rl.waitForFunction(() => document.querySelector("header [aria-live]")?.textContent?.includes("Saved"), null, { timeout: 40000 });
  const { data: rlInvite } = await db.from("onboarding_invites").select("onboarding_responses(answers)").eq("property_name", `${run} Backoff`).single();
  check(`429: shows "Saving…" not an error, then saves (${forced}× 429)`, shown.includes("Saving") && rlInvite.onboarding_responses?.answers["id.property_name"] === "Back-off check");

  // ---- Endpoint guards ------------------------------------------------------------------------
  const api = (body) => anon.request.post(`${base}/api/intake`, { headers: { "content-type": "application/json" }, data: body });
  const rlToken = rlLink.split("/intake/")[1];
  check("api: malformed token → 400", (await api({ action: "save", token: "short", answers: {} })).status() === 400);
  check("api: unknown field key → 422", (await api({ action: "save", token: rlToken, answers: { "evil.key": "x" } })).status() === 422);
  const proto = await anon.request.post(`${base}/api/intake`, {
    headers: { "content-type": "application/json" },
    data: `{"action":"save","token":"${rlToken}","answers":{"__proto__":{"x":1}}}`,
  });
  check("api: __proto__ key → 422", proto.status() === 422);
  check("api: bad Yes/No value → 422", (await api({ action: "save", token: rlToken, answers: { "s03.reception_present": "maybe" } })).status() === 422);
  check("api: body over the size cap → 413", (await api({ action: "save", token: rlToken, answers: { "s02.top_priority_1": "x".repeat(70_000) } })).status() === 413);
  check("api: submit without identification → 422", (await api({ action: "submit", token: rlToken, answers: { "id.property_name": "x" } })).status() === 422);
  const manage = (h) => dash.request.post(`${base}/dashboard/onboarding/manage`, { headers: { "content-type": "application/json", ...h }, data: { op: "revoke", id: invite.id } });
  check("manage: cross-origin refused", (await manage({ origin: "https://evil.example" })).status() === 403);
  check("manage: missing Origin refused", (await manage({})).status() === 403);
  const noSession = await anon.request.post(`${base}/dashboard/onboarding/manage`, {
    headers: { "content-type": "application/json", origin: base },
    data: { op: "revoke", id: invite.id },
    maxRedirects: 0,
  });
  check("manage: no session → sent to login", noSession.status() === 307);
  const exportAnon = await anon.request.get(`${base}/dashboard/onboarding/${invite.id}/export?format=json`, { maxRedirects: 0 });
  check("export: no session → blocked", exportAnon.status() === 307 || exportAnon.status() === 403);

  // ---- Per-IP limit (last: it uses up this machine's quota for a minute) -------------------------
  // Valid-format unknown tokens: refused with 429 before any database lookup once the IP passes 120/min.
  const fake = randomBytes(32).toString("base64url");
  let firstBlocked = 0;
  let blocked = null;
  for (let i = 1; i <= 140 && !blocked; i++) {
    const r = await anon.request.post(`${base}/api/intake`, { headers: { "content-type": "application/json" }, data: { action: "open", token: fake } });
    if (r.status() === 429) [firstBlocked, blocked] = [i, r];
  }
  check(`per-IP limit: 429 after at most 120 requests a minute (blocked at #${firstBlocked} of this burst)`, Boolean(blocked) && firstBlocked <= 121);
  check("per-IP limit: 429 says rate_limited with Retry-After", blocked && (await blocked.json()).status === "rate_limited" && Number(blocked.headers()["retry-after"]) > 0);
} finally {
  await b.close();
  const { data: gone } = await db.from("onboarding_invites").delete().like("property_name", `${run}%`).eq("is_test", true).select("id");
  await db.from("leads").delete().eq("id", lead.id);
  await db.auth.admin.deleteUser(adminUser.user.id);
  console.log(`cleaned up: ${gone?.length ?? 0} test invites, 1 lead, 1 admin`);
}
process.exit(failed ? 1 : 0);
