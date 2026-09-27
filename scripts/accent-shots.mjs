// Accent variants A/B vs the current look: hero (+ CTA hover), key benefits, closing band,
// mobile "How it works" carousel, desktop onboarding timeline (1440 desktop + iPhone 15).
import { chromium, webkit, devices } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "screenshots/accent-blue";
const path = process.argv[4] ?? "/en";
for (const [dev, launcher, opts] of [["desktop", chromium, { viewport: { width: 1440, height: 900 } }], ["mobile", webkit, { ...devices["iPhone 15"] }]]) {
  const b = await launcher.launch(launcher === chromium ? { channel: "chrome" } : {});
  for (const v of ["off", "a", "b"]) {
    const ctx = await b.newContext({ ...opts, reducedMotion: "no-preference" });
    const p = await ctx.newPage();
    await p.goto(`${base}${path}?accent=${v}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${v}-hero-${dev}.png` });
    // hover the hero CTA on desktop to show the glow
    const sec = p.locator("#benefits");
    await sec.scrollIntoViewIfNeeded();
    await p.evaluate(() => { const el = document.querySelector("#benefits"); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 40); });
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${v}-benefits-${dev}.png` });
    // closing night band (headline emphasis + CTA on dark)
    await p.evaluate(() => { const list = [...document.querySelectorAll("main section")]; const band = list[list.length - 1]; window.scrollTo(0, band.getBoundingClientRect().top + scrollY - 120); });
    await p.waitForTimeout(2000);
    await p.screenshot({ path: `${out}/${v}-ctaband-${dev}.png` });
    if (dev === "mobile") {
      // How it works carousel: step counter, step label, active dot, autoplay bar
      await p.evaluate(() => { const el = document.querySelector("#how-it-works"); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 60); });
      await p.waitForTimeout(1800);
      await p.screenshot({ path: `${out}/${v}-howitworks-${dev}.png` });
    }
    if (dev === "desktop") {
      // onboarding timeline with lit nodes
      await p.goto(`${base}${path}/onboarding`, { waitUntil: "networkidle" });
      await p.evaluate(() => { const t = document.querySelector("#onboarding .relative"); window.scrollTo(0, t.getBoundingClientRect().top + scrollY + (t.offsetHeight - innerHeight) * 0.45); });
      await p.waitForTimeout(1500);
      await p.screenshot({ path: `${out}/${v}-onboarding-${dev}.png` });
      await p.goto(`${base}${path}`, { waitUntil: "networkidle" });
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(800);
      const cta = p.locator("#main a[href$='/demo']").first();
      await cta.hover();
      await p.waitForTimeout(600);
      const bb = await cta.boundingBox();
      await p.screenshot({ path: `${out}/${v}-hero-hover-${dev}.png`, clip: { x: bb.x - 40, y: bb.y - 40, width: bb.width + 380, height: bb.height + 80 } });
    }
    await ctx.close();
  }
  await b.close();
}
console.log("done");
