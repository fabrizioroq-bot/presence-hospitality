// Screenshots of the hero photo variants (?hero=1..4) on desktop and iPhone.
import { chromium, webkit, devices } from "playwright";
const [base = "http://localhost:3000", out = "screenshots/hero-photo"] = process.argv.slice(2);
for (const [name, launcher, opts] of [["desktop", chromium, { viewport: { width: 1440, height: 900 } }], ["mobile", webkit, { ...devices["iPhone 15"] }]]) {
  const b = await launcher.launch(launcher === chromium ? { channel: "chrome" } : {});
  for (const v of [1, 2, 3, 4]) {
    const ctx = await b.newContext(opts);
    const p = await ctx.newPage();
    await p.goto(`${base}/en?hero=${v}&nointro`, { waitUntil: "networkidle" });
    await p.waitForTimeout(1800);
    if (name === "mobile") await p.evaluate(() => window.scrollTo(0, document.querySelector(".hero-photo").getBoundingClientRect().top + scrollY - 120));
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${out}/hero-${v}-${name}.png` });
    const img = await p.evaluate(() => { const i = [...document.querySelectorAll("img.hero-variant")].find((x) => x.offsetParent !== null); return i ? { src: i.currentSrc.replace(location.origin, "").slice(0, 90), shown: i.naturalWidth } : null; });
    console.log(name, v, JSON.stringify(img));
    await ctx.close();
  }
  await b.close();
}
