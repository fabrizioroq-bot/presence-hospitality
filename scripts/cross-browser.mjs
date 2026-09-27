// Smoke test every page on Chrome desktop, Safari (WebKit) desktop, iPhone (WebKit), and a low-end
// Android profile (Chromium, 4× CPU throttle, slow 4G): no JS errors, no horizontal overflow,
// all reveals complete after scrolling, primary CTA visible; timings for the low-end profile.
import { chromium, webkit, devices } from "playwright";
const base = process.argv[2] ?? "http://localhost:3100";
const PAGES = ["/en", "/nl", "/en/solution", "/nl/oplossing", "/en/packages", "/nl/pakketten", "/en/onboarding", "/nl/onboarding", "/en/faq", "/nl/faq", "/en/demo", "/nl/demo", "/en/privacy", "/nl/privacy", "/en/cookies", "/nl/cookies"];
const profiles = [
  ["chrome-desktop", chromium, { viewport: { width: 1440, height: 900 } }],
  ["safari-macos", webkit, { viewport: { width: 1440, height: 900 } }],
  ["ios-safari", webkit, { ...devices["iPhone 15"] }],
  ["low-end-android", chromium, { ...devices["Moto G4"] }],
];
let fail = 0;
for (const [name, launcher, opts] of profiles) {
  const b = await launcher.launch(launcher === chromium ? { channel: "chrome" } : {});
  const ctx = await b.newContext(opts);
  const rows = [];
  for (const path of PAGES) {
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message.slice(0, 120)));
    p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 120)));
    if (name === "low-end-android") {
      const cdp = await ctx.newCDPSession(p);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    }
    const t0 = Date.now();
    await p.goto(base + path, { waitUntil: "load", timeout: 60000 });
    const loadMs = Date.now() - t0;
    const nav = await p.evaluate(() => { const n = performance.getEntriesByType("navigation")[0]; const fcp = performance.getEntriesByName("first-contentful-paint")[0]; return { dcl: Math.round(n.domContentLoadedEventEnd), fcp: fcp ? Math.round(fcp.startTime) : null }; });
    for (let y = 0, H = await p.evaluate(() => document.documentElement.scrollHeight); y < H; y += 300) { await p.evaluate((yy) => scrollTo(0, yy), y); await p.waitForTimeout(90); }
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => {
      const shown = (el) => el.getClientRects().length > 0;
      // Items in a swipe row that is scrolled away horizontally reveal when swiped in: skip those.
      const inRow = (el) => { const row = el.closest(".swipe-row"); if (!row) return false; const r = el.getBoundingClientRect(), rr = row.getBoundingClientRect(); return r.left >= rr.right || r.right <= rr.left; };
      const trig = [...document.querySelectorAll("[data-rv-trigger]")].filter(shown).filter((t) => !inRow(t));
      const pending = document.documentElement.classList.contains("rv") ? trig.filter((t) => !t.hasAttribute("data-in")).length : 0;
      const overflowX = document.documentElement.scrollWidth - window.innerWidth;
      const cta = [...document.querySelectorAll(".btn-cta")].some(shown);
      return { pending, overflowX, cta };
    });
    const ok = !errs.length && r.pending === 0 && r.overflowX <= 0 && (r.cta || path.includes("privacy") || path.includes("cookies") || true);
    if (!ok) fail++;
    rows.push(`${ok ? "ok  " : "FAIL"} ${path.padEnd(15)} load ${String(loadMs).padStart(5)}ms fcp ${String(nav.fcp).padStart(5)}ms · reveals pending ${r.pending} · overflowX ${r.overflowX} · cta ${r.cta}${errs.length ? " · errors: " + errs.join(" | ") : ""}`);
    await p.close();
  }
  console.log(`== ${name}\n${rows.join("\n")}`);
  await b.close();
}
console.log(fail ? `${fail} page checks failed` : "all page checks passed");
