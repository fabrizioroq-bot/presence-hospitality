// Frames of the intro loader + timing of its end and of the page handover.
import { chromium, devices } from "playwright";
const [base = "http://localhost:3000", out = "screenshots/loading/intro", profile = "desktop"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
const ctx = await b.newContext(profile === "mobile" ? { ...devices["Pixel 7"] } : { viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.addInitScript(() => {
  window.__introDone = null;
  addEventListener("ph:intro-done", () => (window.__introDone = Math.round(performance.now())));
});
const t0 = Date.now();
await p.goto(base + "/en", { waitUntil: "commit" });
for (const t of [300, 700, 1100, 1500, 1800, 2400]) {
  await p.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
  await p.screenshot({ path: `${out}-${profile}-${t}ms.png` }).catch(() => {});
}
await p.waitForTimeout(800);
console.log(profile, "intro done at", await p.evaluate(() => window.__introDone), "ms · still present:", await p.evaluate(() => !!document.getElementById("ph-intro")), "· errors:", errs);
// second visit in the same session: no intro
await p.goto(base + "/en/solution", { waitUntil: "load" });
console.log("second page load: intro class", await p.evaluate(() => document.documentElement.classList.contains("intro")));
await b.close();
