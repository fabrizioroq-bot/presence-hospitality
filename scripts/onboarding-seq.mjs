// Captures the onboarding timeline at several scroll positions (desktop). Usage: node scripts/onboarding-seq.mjs <base> <outDir>
import { chromium } from "playwright";
const [base, out] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(base + "/en", { waitUntil: "networkidle" });
const top = await p.evaluate(() => document.querySelector("#onboarding").getBoundingClientRect().top + scrollY);
const h = await p.evaluate(() => document.querySelector("#onboarding").getBoundingClientRect().height);
for (let y = top - 900; y < top; y += 300) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(80); }
let i = 0;
for (const f of [0.15, 0.4, 0.65, 0.9]) {
  const y = top + (h - 900) * f;
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(900);
  const lit = await p.$$eval("#onboarding ol.lg\\:grid li span.bg-ink-900", (n) => n.length).catch(() => "?");
  const nodesVisible = await p.$$eval("#onboarding ol.lg\\:grid li", (lis) => lis.filter((li) => { const r = li.querySelector("span")?.getBoundingClientRect(); return r && r.top > 0 && r.bottom < innerHeight; }).length);
  await p.screenshot({ path: `${out}/onboarding-${++i}.png` });
  console.log(`frame ${i} (scroll ${Math.round(f * 100)}% through section): steps lit ${lit}/6, timeline nodes on screen ${nodesVisible}/6`);
}
await b.close();
