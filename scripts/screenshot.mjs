// Usage: node scripts/screenshot.mjs <phase> <path> [path...]
// Full-page screenshots at 390px and 1440px using the local Chrome install.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [phase, ...paths] = process.argv.slice(2);
const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = `screenshots/phase-${phase}`;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
for (const width of [390, 1440]) {
  const ctx = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
    deviceScaleFactor: 1,
    reducedMotion: process.env.REDUCED ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    // Scroll through the page so whileInView reveals fire, then return to top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 300) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(Number(process.env.WAIT ?? 1200));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) console.warn(`OVERFLOW ${overflow}px at ${width}px on ${p}`);
    const name = p.replace(/\//g, "_").replace(/^_/, "") || "root";
    await page.screenshot({ path: `${out}/${name}-${width}.png`, fullPage: process.env.FULL !== "0" });
    console.log(`${out}/${name}-${width}.png`);
  }
  await ctx.close();
}
await browser.close();
