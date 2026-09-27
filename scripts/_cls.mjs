import { chromium } from "playwright";
const [base, path] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: process.env.RM ? "reduce" : "no-preference" })).newPage();
const cdp = await p.context().newCDPSession(p);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
if (process.env.NOINTRO) await p.addInitScript(() => { try { sessionStorage.setItem("ph-intro", "1"); } catch {} });
await p.addInitScript(() => {
  window.__s = [];
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__s.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), src: e.sources.map((s) => { const el = s.node?.nodeType === 3 ? s.node.parentElement : s.node; return `${el?.tagName}.${(el?.className || "").toString().slice(0, 50)} "${(el?.textContent || "").trim().slice(0, 30)}" ${JSON.stringify([Math.round(s.previousRect.y), Math.round(s.currentRect.y), Math.round(s.previousRect.height), Math.round(s.currentRect.height)])}`; }) }))).observe({ type: "layout-shift", buffered: true });
});
if (process.env.BLOCK) await p.route(new RegExp(process.env.BLOCK), (r) => r.abort());
await p.goto(base + path, { waitUntil: "load" });
await p.waitForTimeout(2500);
console.log(JSON.stringify((await p.evaluate(() => window.__s)).filter((s) => s.v > 0.01), null, 1));
await b.close();
