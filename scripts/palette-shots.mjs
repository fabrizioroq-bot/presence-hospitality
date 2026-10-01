// Warm palette preview: default vs ?palette=a / b — hero, light sections (ivory "How it works",
// lavender "Key benefits"), dark section ("The problem"), closing band and footer.
// Usage: node scripts/palette-shots.mjs [base] [out] [variants=off,a,b] [devices=desktop,mobile]
import { chromium, webkit, devices } from "playwright";
import { mkdirSync } from "node:fs";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "screenshots/palette";
const variants = (process.argv[4] ?? "off,a,b").split(",");
const devs = (process.argv[5] ?? "desktop,mobile").split(",");
mkdirSync(out, { recursive: true });
const all = [["desktop", chromium, { viewport: { width: 1440, height: 900 } }], ["mobile", webkit, { ...devices["iPhone 15"] }]];
const to = (p, sel, off = 0) =>
  p.evaluate(([s, o]) => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + o); }, [sel, off]);
for (const [dev, launcher, opts] of all.filter(([d]) => devs.includes(d))) {
  const b = await launcher.launch(launcher === chromium ? { channel: "chrome" } : {});
  for (const v of variants) {
    const ctx = await b.newContext({ ...opts, reducedMotion: "no-preference" });
    const p = await ctx.newPage();
    await p.goto(`${base}/en?palette=${v}&nointro`, { waitUntil: "networkidle" });
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${v}-1-hero-${dev}.png` });
    await to(p, "#problem", 120);
    await p.waitForTimeout(2200);
    await p.screenshot({ path: `${out}/${v}-2-dark-problem-${dev}.png` });
    await to(p, "#how-it-works", dev === "mobile" ? 40 : 0);
    await p.waitForTimeout(2200);
    await p.screenshot({ path: `${out}/${v}-3-light-how-${dev}.png` });
    await to(p, "#benefits", -40);
    await p.waitForTimeout(2200);
    await p.screenshot({ path: `${out}/${v}-4-light-benefits-${dev}.png` });
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await p.waitForTimeout(2200);
    await p.screenshot({ path: `${out}/${v}-5-footer-${dev}.png` });
    await ctx.close();
  }
  await b.close();
}
console.log("done");
