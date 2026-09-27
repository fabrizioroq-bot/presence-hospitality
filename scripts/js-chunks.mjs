// Lists the scripts a page loads before any interaction (gzip transfer size), biggest first.
import { chromium } from "playwright";
const [base, path = "/en", waitMs = "1500"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const cdp = await p.context().newCDPSession(p);
await cdp.send("Network.enable");
const reqs = new Map();
cdp.on("Network.responseReceived", (e) => { if (e.type === "Script") reqs.set(e.requestId, { url: e.response.url, size: 0 }); });
cdp.on("Network.loadingFinished", (e) => { const r = reqs.get(e.requestId); if (r) r.size = e.encodedDataLength; });
await p.goto(base + path, { waitUntil: "networkidle" });
await p.waitForTimeout(+waitMs);
const list = [...reqs.values()].sort((a, c) => c.size - a.size);
let t = 0;
for (const r of list) { t += r.size; console.log(String((r.size / 1024).toFixed(1)).padStart(7), "KB ", r.url.replace(base, "")); }
console.log("TOTAL", (t / 1024).toFixed(1), "KB");
await b.close();
