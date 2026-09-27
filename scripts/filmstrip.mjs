// Filmstrip of the first seconds (cold cache, slow 4G, 4× CPU on mobile): screenshots at fixed times.
// Usage: node scripts/filmstrip.mjs <base> <path> <desktop|mobile> <outPrefix>
import { chromium, devices } from "playwright";
const [base, path, profile, prefix] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
const ctx = await b.newContext(profile === "mobile" ? { ...devices["Pixel 7"] } : { viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
if (profile === "mobile") await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
const t0 = Date.now();
const nav = p.goto(base + path, { waitUntil: "commit" });
await nav;
for (const t of [900, 1400, 2000, 2800, 4000]) {
  await p.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
  await p.screenshot({ path: `${prefix}-${t}ms.png` }).catch(() => {});
}
await b.close();
