// Captures the pinned "How it works" story at several scroll positions (s = 0..6).
import { chromium } from "playwright";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const path = process.argv[2] ?? "/en";
const points = (process.argv[3] ?? "0.2,1.6,2.6,3.7,4.3,4.9,5.5").split(",").map(Number);
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on("pageerror", (e) => console.log("pageerror", e.message.slice(0, 300)));
p.on("console", (m) => { if (m.type() === "error") console.log("console", m.text().slice(0, 300)); });
await p.goto(base + path, { waitUntil: "networkidle" });
await p.mouse.move(700, 400);
const { top, height } = await p.evaluate(() => {
  const el = document.querySelector("#how-it-works .relative[style*='svh']");
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, height: r.height };
});
const vh = 900;
// Approach gradually so the canvas loads.
for (let y = 0; y < top; y += 400) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(60); }
await p.waitForTimeout(1500);
for (const s of points) {
  const y = top + (s / 6) * (height - vh);
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(1400);
  const name = `screenshots/phase-5/story${path.replace("/", "-")}-s${s}.png`;
  await p.screenshot({ path: name });
  console.log(name);
}
await b.close();
