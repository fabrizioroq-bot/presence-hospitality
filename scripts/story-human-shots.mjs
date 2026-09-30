// Screenshots of the human layer in "How it works": desktop pinned story at steps 3, 5, 6 and
// the mobile carousel at the same steps.
import { chromium, webkit, devices } from "playwright";
const [base = "http://localhost:3000", out = "screenshots/story-human", path = "/en"] = process.argv.slice(2);
const d = await chromium.launch({ channel: "chrome" });
const p = await d.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(`${base}${path}?nointro`, { waitUntil: "networkidle" });
await p.mouse.move(400, 400);
const geo = await p.evaluate(() => { const t = document.querySelector("#how-it-works [style*='svh']"); return { top: t.getBoundingClientRect().top + scrollY, h: t.offsetHeight - innerHeight }; });
for (const s of [2.6, 4.7, 5.45]) {
  await p.evaluate((y) => scrollTo(0, y), geo.top + (geo.h * s) / 6);
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `${out}/desktop-s${s}.png` });
}
await d.close();
const w = await webkit.launch();
const m = await (await w.newContext({ ...devices["iPhone 15"] })).newPage();
await m.goto(`${base}${path}?nointro`, { waitUntil: "networkidle" });
await m.evaluate(() => document.querySelector("#how-it-works [role=region]").scrollIntoView({ block: "start" }));
await m.touchscreen.tap(20, 20).catch(() => {});
for (const step of [3, 5, 6]) {
  await m.evaluate((n) => document.querySelectorAll('#how-it-works [role=region] button[aria-label]')[n]?.click(), step); // dot buttons: index = step (after "prev")
  await m.waitForTimeout(1800);
  await m.evaluate(() => { const r = document.querySelector("#how-it-works [role=region]"); window.scrollTo(0, r.getBoundingClientRect().top + scrollY - 70); });
  await m.waitForTimeout(300);
  await m.screenshot({ path: `${out}/mobile-step${step}.png` });
}
await w.close();
console.log("done");
