// Immersion polish checks: cursor ring states + labels, magnetic pull, day→night tint, touch/reduced fallbacks.
import { chromium, webkit, devices } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "screenshots/polish";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
await p.goto(base + "/en", { waitUntil: "networkidle" });
const ring = () => p.evaluate(() => { const r = document.querySelector(".cursor-ring"); return { state: r.dataset.state ?? "", mood: r.dataset.mood, label: r.querySelector("span").textContent, opacity: r.style.opacity }; });
// idle on text
await p.mouse.move(200, 300); await p.waitForTimeout(300);
console.log("on text:", await ring());
// CTA: label + magnetic
const cta = p.locator("#main a.btn-cta").first();
const bb = await cta.boundingBox();
await p.mouse.move(bb.x + bb.width - 8, bb.y + bb.height - 6, { steps: 8 }); await p.waitForTimeout(500);
console.log("on CTA:", await ring(), "translate:", await cta.evaluate((e) => e.style.translate));
await p.screenshot({ path: `${out}/cursor-cta.png`, clip: { x: bb.x - 30, y: bb.y - 40, width: bb.width + 200, height: bb.height + 110 } });
await p.mouse.move(bb.x + bb.width + 300, bb.y + 200, { steps: 5 }); await p.waitForTimeout(600);
console.log("left CTA translate:", JSON.stringify(await cta.evaluate((e) => e.style.translate)));
// nav link
const nav = p.locator('header a[href="/en/solution"]');
const nb = await nav.boundingBox();
await p.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2, { steps: 5 }); await p.waitForTimeout(400);
console.log("on nav link:", await ring());
// stage: drag label on night
await p.locator("#experience figure").scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
const sb = await p.locator("#experience figure").boundingBox();
await p.mouse.move(sb.x + sb.width * 0.7, sb.y + sb.height * 0.5, { steps: 6 }); await p.waitForTimeout(500);
console.log("on stage:", await ring());
await p.screenshot({ path: `${out}/cursor-drag.png`, clip: { x: sb.x + sb.width * 0.7 - 80, y: sb.y + sb.height * 0.5 - 60, width: 260, height: 140 } });
// form field hides the ring
await p.goto(base + "/en/demo", { waitUntil: "networkidle" });
const inp = p.locator("#demo-first_name"); const ib = await inp.boundingBox();
await p.mouse.move(ib.x + 20, ib.y + 10, { steps: 4 }); await p.waitForTimeout(300);
console.log("on input:", await ring());
// day → night
await p.goto(base + "/en", { waitUntil: "networkidle" });
const bg = () => p.evaluate(() => ({ dusk: getComputedStyle(document.documentElement).getPropertyValue("--dusk"), mist: getComputedStyle(document.querySelector("#benefits")).backgroundColor, night: getComputedStyle(document.querySelector("#problem")).backgroundColor }));
console.log("top:", await bg());
await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(600);
console.log("bottom:", await bg());
await b.close();
// touch + reduced motion: no ring
const w = await webkit.launch();
const m = await (await w.newContext({ ...devices["iPhone 15"] })).newPage();
await m.goto(base + "/en", { waitUntil: "networkidle" });
console.log("iPhone ring opacity:", JSON.stringify(await m.evaluate(() => document.querySelector(".cursor-ring").style.opacity)));
await w.close();
const r = await chromium.launch({ channel: "chrome" });
const rp = await (await r.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
await rp.goto(base + "/en", { waitUntil: "networkidle" });
await rp.mouse.move(400, 400, { steps: 3 });
console.log("reduced ring opacity:", JSON.stringify(await rp.evaluate(() => document.querySelector(".cursor-ring").style.opacity)));
await r.close();
console.log("errors", errs);
