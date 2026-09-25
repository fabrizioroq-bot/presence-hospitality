// Loads the hero, moves the mouse to trigger WebGL, waits for formation, screenshots viewport.
import { chromium } from "playwright";
const [path = "/en", width = "1440", wait = "4500", out = "screenshots/phase-3/hero"] = process.argv.slice(2);
const w = Number(width);
const b = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=metal"] });
const p = await b.newPage({ viewport: { width: w, height: w < 600 ? 844 : 900 }, reducedMotion: process.env.REDUCED ? "reduce" : "no-preference" });
p.on("console", (m) => { if (["error", "warning"].includes(m.type())) console.log("console", m.type(), m.text().slice(0, Number(process.env.MSG ?? 400))); });
p.on("pageerror", (e) => console.log("pageerror", e.message.slice(0, 400)));
await p.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
await p.mouse.move(w * 0.7, 380);
await p.waitForTimeout(Number(wait));
await p.mouse.move(w * 0.76, 420, { steps: 8 });
await p.waitForTimeout(400);
console.log("webgl:", await p.evaluate(() => document.querySelector("#top")?.getAttribute("data-webgl")));
await p.screenshot({ path: `${out}-${w}${process.env.REDUCED ? "-reduced" : ""}.png` });
await b.close();
