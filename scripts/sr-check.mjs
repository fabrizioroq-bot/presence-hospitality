// What screen readers get for the hero stage, the Holobox stage and the savings tile (ARIA snapshot).
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto((process.argv[2] ?? "http://localhost:3000") + "/en", { waitUntil: "networkidle" });
for (const sel of ["#top figure", "#experience figure", "#key-benefits > :first-child"]) {
  const loc = p.locator(sel).first();
  if (!(await loc.count())) { console.log(sel, "not found"); continue; }
  await loc.scrollIntoViewIfNeeded();
  await p.waitForTimeout(600); // mid count-up for the ticker
  console.log(`--- ${sel}\n${await loc.ariaSnapshot()}`);
}
await b.close();
