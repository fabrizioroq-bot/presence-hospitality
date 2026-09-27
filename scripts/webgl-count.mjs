// Counts live WebGL canvases while scrolling Home (desktop): off-screen scenes must unmount.
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(base + "/en", { waitUntil: "networkidle" });
await p.mouse.move(400, 400);
await p.waitForTimeout(2500);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
let max = 0;
const rows = [];
for (let y = 0; y <= H; y += 900) {
  await p.evaluate((yy) => scrollTo(0, yy), y);
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => {
    const cs = [...document.querySelectorAll("canvas[data-engine]")];
    const where = cs.map((c) => (c.closest("#top") ? "hero" : c.closest("#how-it-works") ? "story" : c.closest("#experience") ? "stage" : "?"));
    return where;
  });
  max = Math.max(max, r.length);
  rows.push(`${String(y).padStart(6)}: ${r.join(",") || "-"}`);
}
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(2500);
const back = await p.evaluate(() => ({ canvases: document.querySelectorAll("canvas[data-engine]").length, ready: document.querySelector("#top")?.getAttribute("data-webgl") }));
console.log(rows.join("\n"));
console.log("max live WebGL canvases:", max, "| back at top:", JSON.stringify(back));
await b.close();
