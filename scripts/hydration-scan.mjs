// Loads each route and reports console errors (hydration etc.).
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const routes = process.argv.slice(3);
const b = await chromium.launch({ channel: "chrome" });
for (const r of routes) {
  for (const reduced of [false, true]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message.split("\n")[0].slice(0, 140)));
    p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().split("\n")[0].slice(0, 140)); });
    await p.goto(base + r, { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    console.log(`${r.padEnd(16)} ${reduced ? "reduced" : "motion "}  ${errs.length ? "ERRORS: " + [...new Set(errs)].join(" | ") : "ok"}`);
    await ctx.close();
  }
}
await b.close();
