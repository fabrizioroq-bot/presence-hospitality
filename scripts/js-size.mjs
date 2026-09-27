// Initial JS per page (gzip transfer bytes of scripts loaded before any interaction), production server.
import { chromium } from "playwright";
const [base, ...paths] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
for (const path of paths) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const cdp = await p.context().newCDPSession(p);
  await cdp.send("Network.enable");
  const bytes = new Map();
  cdp.on("Network.responseReceived", (e) => { if (e.type === "Script") bytes.set(e.requestId, 0); });
  cdp.on("Network.loadingFinished", (e) => { if (bytes.has(e.requestId)) bytes.set(e.requestId, e.encodedDataLength); });
  await p.goto(base + path, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const total = [...bytes.values()].reduce((a, c) => a + c, 0);
  console.log(`${path.padEnd(16)} ${(total / 1024).toFixed(0)} KB (${bytes.size} scripts)`);
  await p.close();
}
await b.close();
