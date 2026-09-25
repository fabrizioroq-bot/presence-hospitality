// Clicks each navbar link and reports where the page lands relative to the target section.
import { chromium } from "playwright";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(base + "/en", { waitUntil: "networkidle" });
const links = await p.$$eval('header nav a[href^="#"]', (as) => as.map((a) => a.getAttribute("href")));
for (const href of links) {
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(400);
  const exists = await p.evaluate((h) => !!document.querySelector(h), href);
  if (!exists) { console.log(`${href}: section not built yet`); continue; }
  await p.click(`header nav a[href="${href}"]`);
  await p.waitForTimeout(2200);
  const r = await p.evaluate((h) => {
    const el = document.querySelector(h);
    return { top: Math.round(el.getBoundingClientRect().top), url: location.hash, focused: document.activeElement === el };
  }, href);
  console.log(`${href}: section top at ${r.top}px (nav 72 + 16 → expect ~88), url ${r.url}, focus on target: ${r.focused}`);
}
await b.close();
