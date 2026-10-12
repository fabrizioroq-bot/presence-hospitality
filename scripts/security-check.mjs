// Visits every page, scrolls (wakes the WebGL scenes), reports CSP violations, missing security
// headers, page errors and cookie flags; then checks the language switch persists.
// Usage: node scripts/security-check.mjs <base> [vercelBypassToken]
import { chromium } from "playwright";
const [base, bypass] = process.argv.slice(2);
const PATHS = [
  "/en", "/nl", "/en/solution", "/nl/oplossing", "/en/packages", "/nl/pakketten",
  "/en/onboarding", "/nl/onboarding", "/en/faq", "/nl/faq", "/en/demo", "/nl/demo",
  "/en/about", "/nl/over-ons", "/en/privacy", "/nl/privacy", "/en/cookies", "/nl/cookies",
  "/dashboard/login", "/dashboard/forgot",
];
const WANT = [
  "strict-transport-security", "x-content-type-options", "x-frame-options", "referrer-policy",
  "permissions-policy", "cross-origin-opener-policy", "cross-origin-resource-policy", "x-xss-protection",
];
const b = await chromium.launch({ channel: "chrome" });
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  extraHTTPHeaders: bypass ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" } : {},
});
await ctx.addInitScript(() => {
  window.__csp = [];
  document.addEventListener("securitypolicyviolation", (e) =>
    window.__csp.push(`${e.disposition} ${e.effectiveDirective} ${e.blockedURI || "(inline)"} ${e.sourceFile ?? ""}:${e.lineNumber}`));
});
let bad = 0;
for (const path of PATHS) {
  const p = await ctx.newPage();
  const errs = [];
  const consoleCsp = [];
  p.on("pageerror", (e) => errs.push(e.message.slice(0, 160)));
  // Chrome notes that upgrade-insecure-requests is ignored in report-only mode: not a violation.
  p.on("console", (m) => /Content Security Policy|Refused to/.test(m.text()) && !/is ignored when delivered in a report-only/.test(m.text()) && consoleCsp.push(m.text().slice(0, 220)));
  const res = await p.goto(`${base}${path}?nointro`, { waitUntil: "networkidle" });
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
  });
  await p.waitForTimeout(1200);
  const h = res.headers();
  const missing = WANT.filter((k) => !h[k] && !(k === "strict-transport-security" && base.startsWith("http:")));
  const policy = h["content-security-policy"] ?? h["content-security-policy-report-only"] ?? "";
  const csp = h["content-security-policy"] ? "enforced" : policy ? "report-only" : "NONE";
  const v = [...new Set([...(await p.evaluate(() => window.__csp)), ...consoleCsp])];
  const canvases = await p.locator("canvas").count();
  const ok = res.status() < 400 && !missing.length && csp !== "NONE" && !v.length && !errs.length;
  if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"} ${res.status()} ${path}  csp=${csp}${policy.includes("nonce-") ? "+nonce" : ""} canvas=${canvases}${missing.length ? " MISSING=" + missing : ""}`);
  v.forEach((x) => console.log("   violation:", x));
  errs.forEach((x) => console.log("   pageerror:", x));
  await p.close();
}
// Language switch: EN → click EN|NL → the Dutch page renders.
const p = await ctx.newPage();
await p.goto(`${base}/en?nointro`, { waitUntil: "networkidle" });
await p.locator('a[hreflang="nl"]').first().click();
await p.waitForURL(/\/nl/);
await p.waitForLoadState("networkidle");
const sw = (await p.getAttribute("html", "lang")) === "nl";
if (!sw) bad++;
console.log(`${sw ? "PASS" : "FAIL"} language switch EN → NL (${new URL(p.url()).pathname})`);
for (const c of await ctx.cookies()) {
  if (c.name.startsWith("_vercel")) continue;
  console.log(`cookie ${c.name}: secure=${c.secure} httpOnly=${c.httpOnly} sameSite=${c.sameSite}`);
}
await b.close();
console.log(bad ? `${bad} FAILED` : "ALL PASS");
process.exit(bad ? 1 : 0);
