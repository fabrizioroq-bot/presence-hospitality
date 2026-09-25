// Scrolls to the footer and screenshots the viewport to verify the navbar switches to its night style.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: Number(process.env.H ?? 900) } });
await p.goto((process.env.BASE_URL ?? "http://localhost:3000") + "/en", { waitUntil: "networkidle" });
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await p.waitForTimeout(300);
await p.mouse.wheel(0, -200); // scroll up a bit so the nav is shown
await p.waitForTimeout(800);
await p.screenshot({ path: "screenshots/phase-2/nav-night-1440.png" });
await b.close();
