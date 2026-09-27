// Mobile: open the menu sheet, go to another page; the sheet closes, scroll works, sticky CTA behaves.
import { webkit, devices } from "playwright";
const base = process.argv[2] || "http://localhost:3000";
const b = await webkit.launch();
const ctx = await b.newContext({ ...devices["iPhone 15"] });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
await p.goto(base + "/nl", { waitUntil: "networkidle" });
await p.click('header button[aria-expanded]');
await p.waitForTimeout(500);
await p.click('[role="dialog"] a[href="/nl/pakketten"]');
await p.waitForURL((u) => u.pathname === "/nl/pakketten", { timeout: 8000 });
await p.waitForTimeout(1200);
const r = await p.evaluate(() => ({
  dialog: !!document.querySelector('[role="dialog"]:not([hidden])') && getComputedStyle(document.querySelector('[role="dialog"]')).visibility !== "hidden",
  bodyOverflow: getComputedStyle(document.body).overflow, htmlOverflow: getComputedStyle(document.documentElement).overflow,
  y: scrollY, h1: document.querySelector("h1")?.textContent,
}));
await p.evaluate(() => window.scrollBy(0, 1500));
await p.waitForTimeout(800);
r.yAfterScroll = await p.evaluate(() => scrollY);
console.log(r, "errors", errs);
await b.close();
