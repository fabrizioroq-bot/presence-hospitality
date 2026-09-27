import { chromium } from "playwright";
const [base, path] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await p.context().newCDPSession(p);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
const t0 = Date.now();
await p.goto(base + path, { waitUntil: "commit" });
for (const t of [820, 900, 1000, 1300]) {
  await p.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
  await p.screenshot({ path: `/private/tmp/claude-501/-Users-agustinroque-Desktop-PresenceHospitality/d2697491-c2d8-4a3e-893a-13753dd6b0f1/scratchpad/sol-${t}.png`, clip: { x: 0, y: 560, width: 1440, height: 340 } });
  console.log(t, await p.evaluate(() => ({ intro: document.documentElement.className.includes("intro"), sw: innerWidth - document.documentElement.clientWidth, fonts: [...document.fonts].filter((f) => f.status === "loaded").length })));
}
await b.close();
