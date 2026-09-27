// Screenshots for the pre-production review fixes.
import { chromium, webkit, devices } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "screenshots/review-fixes";
const chrome = await chromium.launch({ channel: "chrome" });
const wk = await webkit.launch();

// Footer: desktop + mobile (contacts, phones with labels, credit)
for (const [name, b, opts] of [["desktop", chrome, { viewport: { width: 1440, height: 900 } }], ["mobile", wk, { ...devices["iPhone 15"] }]]) {
  const p = await (await b.newContext(opts)).newPage();
  await p.goto(base + "/en", { waitUntil: "networkidle" });
  await p.locator("footer").scrollIntoViewIfNeeded();
  await p.waitForTimeout(800);
  await p.locator("footer").screenshot({ path: `${out}/footer-${name}.png` });
  await p.close();
}

// "Less desk" carousel on mobile: each card, equal heights, no border on "Predictable cost"
{
  const p = await (await wk.newContext({ ...devices["iPhone 15"] })).newPage();
  await p.goto(base + "/en", { waitUntil: "networkidle" });
  const row = p.locator("#key-benefits");
  await row.scrollIntoViewIfNeeded();
  await p.waitForTimeout(2200);
  for (const i of [0, 2]) {
    await row.evaluate((el, i) => (el.scrollLeft = el.children[i].offsetLeft - 16), i);
    await p.waitForTimeout(700);
    await p.locator("#benefits").screenshot({ path: `${out}/key-benefits-mobile-card${i + 1}.png` });
  }
  await p.close();
}

// "The problem" at 520, 600 and 700 px while scrolling through it
for (const w of [520, 600, 700]) {
  const p = await (await chrome.newContext({ viewport: { width: w, height: 800 } })).newPage();
  await p.goto(base + "/en", { waitUntil: "networkidle" });
  await p.evaluate(() => { const el = document.querySelector("#problem"); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 60); });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/problem-${w}px.png` });
  await p.close();
}
await chrome.close();
await wk.close();
console.log("done");
