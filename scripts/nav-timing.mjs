// Page-to-page timing on slow 4G: hover a footer link (as a user would before clicking), click,
// and time until the new page is shown (URL changed, transition veil gone, H1 painted).
import { chromium } from "playwright";
const base = process.argv[2];
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await p.context().newCDPSession(p);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
await p.goto(base + "/en", { waitUntil: "load" });
await p.waitForTimeout(3500); // intro + settle
const rows = [];
for (const target of ["/en/faq", "/en/onboarding", "/en/solution"]) {
  const link = p.locator(`footer a[href="${target}"]`);
  await link.scrollIntoViewIfNeeded();
  await link.hover();
  await p.waitForTimeout(600); // typical hover-to-click time
  const t0 = Date.now();
  await link.click();
  await p.waitForURL((u) => u.pathname === target, { timeout: 20000 });
  await p.waitForFunction(() => !document.querySelector("canvas.fixed") && document.querySelector("h1"), null, { timeout: 20000 });
  rows.push(`${target.padEnd(16)} ${Date.now() - t0} ms`);
  await p.goto(base + "/en", { waitUntil: "load" });
  await p.waitForTimeout(1500);
}
console.log(base, "\n  " + rows.join("\n  "));
await b.close();
