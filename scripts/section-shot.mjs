// Screenshots a single section (by CSS selector) after scrolling it into view and letting reveals finish.
// Usage: node scripts/section-shot.mjs <path> <selector> <out-name> [width]
import { chromium } from "playwright";
const [path, selector, name, width = "1440"] = process.argv.slice(2);
const w = Number(width);
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: w, height: w < 600 ? 844 : 900 }, reducedMotion: process.env.REDUCED ? "reduce" : "no-preference" });
p.on("pageerror", (e) => console.log("pageerror", e.message.slice(0, 300)));
p.on("console", (m) => { if (m.type() === "error") console.log("console", m.text().slice(0, 300)); });
await p.goto((process.env.BASE_URL ?? "http://localhost:3000") + path, { waitUntil: "networkidle" });
const el = p.locator(selector).first();
const box = await el.boundingBox();
for (let y = 0; y < box.y + box.height; y += 250) {
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(120);
}
await el.scrollIntoViewIfNeeded();
await p.waitForTimeout(Number(process.env.WAIT ?? 3000));
const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
if (overflow > 0) console.log(`OVERFLOW ${overflow}px`);
await el.screenshot({ path: `screenshots/${name}-${w}.png` });
console.log(`screenshots/${name}-${w}.png`);
await b.close();
