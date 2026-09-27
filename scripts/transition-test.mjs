// Clicks page links and checks the particle veil shows, the route changes client-side (no reload),
// the new page lands at top (or at the hash target), and the veil clears.
import { chromium } from "playwright";
const base = process.argv[2] || "http://localhost:3000";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
await p.goto(base + "/en", { waitUntil: "networkidle" });
await p.waitForFunction(() => !document.getElementById("ph-intro"), null, { timeout: 6000 }).catch(() => {}); // intro loader (first visit)
await p.evaluate(() => (window.__marker = 1));
const checks = [];
async function go(sel, expectPath, hash) {
  if (sel.startsWith("footer")) await p.locator(sel).scrollIntoViewIfNeeded();
  else { await p.evaluate(() => window.scrollTo(0, 600)); await p.waitForTimeout(200); await p.mouse.wheel(0, -200); }
  await p.waitForTimeout(500);
  const y0 = await p.evaluate(() => Math.round(scrollY));
  const t0 = Date.now();
  await p.click(sel);
  await p.waitForTimeout(150);
  const veil = await p.locator("canvas.fixed").count();
  await p.waitForURL((u) => u.pathname === expectPath, { timeout: 8000 });
  await p.waitForFunction(() => !document.querySelector("canvas.fixed"), null, { timeout: 8000 });
  await p.waitForTimeout(400);
  const r = await p.evaluate((h) => ({
    marker: window.__marker, y: Math.round(window.scrollY), path: location.pathname + location.hash,
    hashTop: h ? Math.round(document.getElementById(h)?.getBoundingClientRect().top ?? -1) : null,
    h1: document.querySelector("h1")?.textContent?.slice(0, 40),
  }), hash);
  checks.push({ sel, y0, veil, ms: Date.now() - t0, ...r });
}
await go('header a[href="/en/solution"]', "/en/solution");
await go('header a[href="/en/packages"]', "/en/packages");
await go('header a[href="/en#how-it-works"]', "/en", "how-it-works");
await go('footer a[href="/en/faq"]', "/en/faq");
await go('footer a[href="/en/demo"]', "/en/demo");
console.log(JSON.stringify(checks, null, 1));
console.log("errors", errs);
await b.close();
