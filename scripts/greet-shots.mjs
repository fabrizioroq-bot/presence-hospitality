// Captures the hero hologram through its greeting (nod) after the WebGL scene forms.
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "screenshots/polish";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=metal", "--enable-gpu"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(base + "/en", { waitUntil: "networkidle" });
await p.mouse.move(300, 300); // first interaction loads the scene
await p.waitForSelector('[data-webgl="ready"]', { timeout: 20000 });
const portal = p.locator("[data-portal]").first();
const t0 = Date.now();
for (const t of [1500, 2500, 3000, 3300, 3600, 3900, 4200]) {
  await p.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
  const bb = await portal.boundingBox();
  await p.screenshot({ path: `${out}/greet-${t}ms.png`, clip: { x: bb.x + bb.width * 0.25, y: bb.y + 40, width: bb.width * 0.5, height: bb.height * 0.45 } });
}
await b.close();
console.log("done");
