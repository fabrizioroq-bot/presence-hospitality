// Hero + key-benefits section for the current look and accent variants A/B (desktop 1440 + iPhone 15).
import { chromium, webkit, devices } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "screenshots/accent";
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
    if (dev === "desktop") {
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(800);
      await p.hover("#main a[href$='/demo']");
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${out}/${v}-hero-hover-${dev}.png`, clip: { x: 0, y: 380, width: 720, height: 320 } });
    }
    await ctx.close();
  }
  await b.close();
}
console.log("done");
