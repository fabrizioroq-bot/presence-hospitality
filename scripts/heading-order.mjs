// Flags heading-level skips (e.g. h1 → h3) on each page.
import { chromium } from "playwright";
const [base, ...paths] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const path of paths) {
  await p.goto(base + path, { waitUntil: "domcontentloaded" });
  await p.waitForFunction(() => !document.getElementById("ph-intro"), null, { timeout: 6000 }).catch(() => {}); // intro loader (first visit)
  const r = await p.$$eval("h1,h2,h3,h4,h5,h6", (hs) => {
    const out = []; let prev = 0;
    for (const h of hs) { const l = +h.tagName[1]; if (prev && l > prev + 1) out.push(`h${prev}→h${l} "${h.textContent.trim().slice(0, 30)}"`); prev = l; }
    return { count: hs.length, h1: hs.filter((h) => h.tagName === "H1").length, skips: out };
  });
  console.log(path.padEnd(16), `h1×${r.h1}`, r.skips.length ? r.skips.join(" | ") : "ok");
}
await b.close();
