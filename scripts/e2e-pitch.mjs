// Smoke test for /dashboard/pitch as a temporary admin (created with the service role key, always deleted):
// keyboard + clicker navigation through every chapter (hash and aria-live), click-to-advance, Home/End,
// overview, blank screen, fullscreen, console errors, and offline reload after the cache warms
// (production builds only: the service worker is not registered in dev).
// Usage: node scripts/e2e-pitch.mjs [baseUrl]   (default http://localhost:3000)
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const base = process.argv[2] ?? "http://localhost:3000";
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const email = `e2e-pitch-${Date.now()}@example.com`;
const password = randomBytes(18).toString("base64url") + "Aa1";
const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: "admin" } });
if (error) throw error;

let failed = false;
const check = (label, ok) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failed = true;
};
// Every build of every chapter, in order (mirrors src/components/pitch/chapters.ts).
const POSITIONS = [
  "#cover", "#cover/2", "#problem", "#problem/2", "#problem/3", "#solution", "#solution/2", "#solution/3",
  "#how-it-works", "#how-it-works/2", "#how-it-works/3", "#behind-the-scenes", "#behind-the-scenes/2",
  "#behind-the-scenes/3", "#packages", "#packages/2", "#packages/3", "#pricing", "#pricing/2", "#close", "#close/2",
];
const LAST = POSITIONS.at(-1);

const b = await chromium.launch({ channel: "chrome" });
try {
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(`${base}/dashboard/pitch`);
  check("signed out: redirected to login", page.url().includes("/dashboard/login"));
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${base}/dashboard`);
  await page.goto(`${base}/dashboard/pitch`, { waitUntil: "networkidle" });

  const hash = () => page.evaluate(() => location.hash);
  const live = () => page.locator("[aria-live='polite']").textContent();
  check("opens on the cover (#cover)", (await hash()) === "#cover");
  check("cover headline is real text", (await page.locator("h1").textContent())?.includes("Stop hiring"));

  // Forward through every build with a mix of keyboard and clicker keys.
  const keys = ["ArrowRight", " ", "PageDown"];
  for (let i = 1; i < POSITIONS.length; i++) {
    await page.keyboard.press(keys[i % keys.length]);
    await page.waitForTimeout(150);
    check(`forward → ${POSITIONS[i]}`, (await hash()) === POSITIONS[i]);
  }
  check("aria-live announces the last chapter", (await live())?.includes("Chapter 8 of 8"));
  await page.keyboard.press("ArrowRight");
  check("stays on the last build at the end", (await hash()) === LAST);
  check("closing QR code is rendered", (await page.getByRole("img", { name: /Scan for/ }).count()) === 1);

  await page.keyboard.press("PageUp");
  check("back (PageUp) → #close", (await hash()) === "#close");
  await page.keyboard.press("Home");
  check("Home → #cover", (await hash()) === "#cover");
  await page.mouse.click(400, 500);
  check("click advances → #cover/2", (await hash()) === "#cover/2");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  check("back past the first build stays on #cover", (await hash()) === "#cover");
  await page.keyboard.press("End");
  check(`End → ${LAST}`, (await hash()) === LAST);

  // The comparison slider owns the arrow keys while focused (moves the slider, not the presentation).
  await page.goto(`${base}/dashboard/pitch#solution`, { waitUntil: "networkidle" });
  const slider = page.getByRole("slider");
  await slider.focus();
  const before = Number(await slider.inputValue());
  await page.keyboard.press("ArrowRight");
  check("arrow on the focused slider moves it, not the deck", Number(await slider.inputValue()) > before && (await hash()) === "#solution");
  await page.keyboard.press("Tab");

  await page.goto(`${base}/dashboard/pitch#packages`, { waitUntil: "networkidle" });
  check("deep link #packages opens that chapter", (await live())?.includes("Packages"));

  const premium = page.getByRole("button", { name: "24/7 Premium" });
  await premium.click();
  check("clicking a package selects it without advancing", (await premium.getAttribute("aria-pressed")) === "true" && (await hash()) === "#packages");

  await page.keyboard.press("n");
  const notes = page.getByRole("complementary", { name: "Presenter notes" });
  check("N shows the presenter notes", await notes.isVisible());

  await page.keyboard.press("o");
  check("O opens the overview", await page.getByRole("dialog").isVisible());
  await page.keyboard.press("Escape");
  check("Esc closes the overview", (await page.getByRole("dialog").count()) === 0);

  await page.keyboard.press("b");
  check("B blanks the screen", (await page.locator("text=Screen blanked").count()) === 1);
  await page.keyboard.press("ArrowRight");
  check("any key un-blanks without moving", (await page.locator("text=Screen blanked").count()) === 0 && (await hash()) === "#packages");

  await page.keyboard.press("f");
  await page.waitForTimeout(400);
  check("F enters fullscreen", await page.evaluate(() => document.fullscreenElement !== null));
  check("notes hide automatically in fullscreen", (await notes.count()) === 0);
  await page.keyboard.press("n");
  check("N shows the notes again in fullscreen", await notes.isVisible());
  await page.keyboard.press("n");
  await page.keyboard.press("f");
  await page.waitForTimeout(400);
  check("F leaves fullscreen", await page.evaluate(() => document.fullscreenElement === null));

  check(`no console errors${errors.length ? `: ${errors.join(" | ")}` : ""}`, errors.length === 0);

  // Offline (production builds): wait for the cache to warm ("Available offline"), reload without network.
  if (process.env.SKIP_OFFLINE !== "1") {
    await page.goto(`${base}/dashboard/pitch#cover`, { waitUntil: "networkidle" });
    await page.waitForTimeout(7000); // the shell warms the cache ~5 s after load
    await page.keyboard.press("o"); // the offline indicator lives in the presenter's overview only
    const warmed = await page.getByRole("img", { name: "Available offline" }).waitFor({ timeout: 15000 }).then(() => true, () => false);
    check("offline cache warmed (icon in the overview)", warmed);
    await page.keyboard.press("Escape");
    check("offline indicator is not shown outside the overview", (await page.getByRole("img", { name: "Available offline" }).count()) === 0);
    await ctx.setOffline(true);
    await page.reload({ waitUntil: "load" }).catch(() => {});
    await page.waitForTimeout(1500);
    check("reloads offline with the cover", (await page.locator("h1").textContent().catch(() => ""))?.includes("Stop hiring"));
    await ctx.setOffline(false);
  }
} finally {
  await b.close();
  await admin.auth.admin.deleteUser(data.user.id);
}
process.exit(failed ? 1 : 0);
