// Verifies the pinned onboarding timeline: nodes stay on screen while scrolling drives the steps,
// and the pin releases only after all six are lit. Usage: node scripts/onboarding-pin.mjs <base> <outDir> [width] [height] [engine]
import { chromium, webkit } from "playwright";
const [base, out, w = "1440", h = "900", engine = "chromium"] = process.argv.slice(2);
const b = await (engine === "webkit" ? webkit.launch() : chromium.launch({ channel: "chrome" }));
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(base + (process.env.ONB_PATH ?? "/en/onboarding"), { waitUntil: "networkidle" });
const info = await p.evaluate(() => {
  const track = document.querySelector("#onboarding .relative");
  const r = track.getBoundingClientRect();
  return { top: r.top + scrollY, height: r.height };
});
const pinDist = info.height - +h;
console.log(`${engine} ${w}×${h}: pin track ${Math.round(info.height)}px → pinned for ${Math.round(pinDist)}px (${(pinDist / +h).toFixed(2)} screens)`);
for (let y = info.top - 1200; y < info.top; y += 300) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(60); }
let i = 0;
for (const f of [0, 0.25, 0.5, 0.76, 0.9, 1.0, 1.15]) {
  const y = info.top + pinDist * f;
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const lis = [...document.querySelectorAll("#onboarding ol.lg\\:grid > li")];
    const nodes = lis.map((li) => li.querySelectorAll(":scope > div")[1]?.querySelector("span"));
    const lit = nodes.filter((n) => n?.className.includes("bg-ink-900")).length;
    const onScreen = nodes.filter((n) => { const b = n?.getBoundingClientRect(); return b && b.top >= 0 && b.bottom <= innerHeight; }).length;
    const cards = [...document.querySelectorAll("#onboarding ol.lg\\:grid .rounded-lg")];
    const cardsIn = cards.filter((c) => { const b = c.getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight; }).length;
    return { lit, onScreen, cardsIn };
  });
  await p.screenshot({ path: `${out}/onboarding-${engine}-${w}x${h}-${++i}.png` });
  console.log(`  ${String(Math.round(f * 100)).padStart(3)}% of pin: steps lit ${r.lit}/6 · nodes on screen ${r.onScreen}/6 · cards fully visible ${r.cardsIn}/6`);
}
await b.close();
