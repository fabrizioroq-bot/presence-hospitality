// Measures the mobile page length per top-level block (iPhone 15 / WebKit).
import { webkit, devices } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const b = await webkit.launch();
const ctx = await b.newContext({ ...devices["iPhone 15"] });
const p = await ctx.newPage();
await p.goto(base + "/en", { waitUntil: "networkidle" });
const vh = devices["iPhone 15"].viewport.height;
const rows = await p.evaluate(() => {
  const out = [];
  const blocks = [...document.querySelectorAll("main > *"), document.querySelector("footer")];
  for (const el of blocks) {
    const h = el.getBoundingClientRect().height;
    if (h < 1) continue;
    const id = el.id || el.querySelector("section[id]")?.id || (el.getAttribute("aria-hidden") ? "transition band" : el.tagName.toLowerCase());
    const ids = [...el.querySelectorAll("section[id]")].map((s) => s.id).join("+");
    out.push([ids && ids !== id ? `${id} (${ids})` : id, Math.round(h)]);
  }
  return { out, total: Math.round(document.documentElement.scrollHeight) };
});
let bands = 0;
for (const [name, h] of rows.out) {
  if (name === "transition band") { bands += h; continue; }
  console.log(`${name.padEnd(34)} ${String(h).padStart(6)}px  ${(h / vh).toFixed(1).padStart(4)} screens`);
}
console.log(`${"transition bands (total)".padEnd(34)} ${String(bands).padStart(6)}px  ${(bands / vh).toFixed(1).padStart(4)} screens`);
console.log(`${"TOTAL page".padEnd(34)} ${String(rows.total).padStart(6)}px  ${(rows.total / vh).toFixed(1).padStart(4)} screens (viewport ${vh}px)`);
await b.close();
