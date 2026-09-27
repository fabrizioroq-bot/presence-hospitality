// CSS reveals: hidden before view, shown after scrolling into view; nothing left hidden at the end;
// everything visible immediately with reduced motion and without JS.
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ["/en", "/en/solution", "/en/packages", "/en/onboarding", "/nl/faq", "/en/demo"];
const b = await chromium.launch({ channel: "chrome" });
const state = (p) => p.evaluate(() => {
  const shown = (el) => el.getClientRects().length > 0; // rendered (not display:none, e.g. mobile-only rows on desktop)
  const t = [...document.querySelectorAll("[data-rv-trigger]")].filter(shown);
  const hiddenEls = [...document.querySelectorAll("[data-rv]")].filter(shown).filter((el) => { const cs = getComputedStyle(el); return +cs.opacity < 0.5 || cs.filter.includes("blur") || (cs.clipPath && cs.clipPath !== "none"); });
  const hidden = hiddenEls;
  window.__hidden = hiddenEls.map((e) => `${e.tagName}.${e.getAttribute("data-rv")} ${(e.textContent || "").trim().slice(0, 30)} op=${getComputedStyle(e).opacity} f=${getComputedStyle(e).filter}`);
  return { triggers: t.length, in: t.filter((e) => e.hasAttribute("data-in")).length, hiddenItems: hidden.length, cls: document.documentElement.className.includes("rv-on") };
});
for (const path of paths) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(base + path, { waitUntil: "networkidle" });
  const before = await state(p);
  for (let y = 0, H = await p.evaluate(() => document.documentElement.scrollHeight); y < H; y += 400) { await p.evaluate((yy) => scrollTo(0, yy), y); await p.waitForTimeout(90); }
  await p.waitForTimeout(3500);
  const after = await state(p);
  console.log(path.padEnd(16), "before", JSON.stringify(before), "after", JSON.stringify(after));
  if (after.hiddenItems) console.log("   ", (await p.evaluate(() => window.__hidden)).join("\n    "));
  await p.close();
}
// reduced motion + no JS
const ctx = await b.newContext({ reducedMotion: "reduce" });
const r = await ctx.newPage(); await r.goto(base + "/en", { waitUntil: "networkidle" });
console.log("reduced /en", JSON.stringify(await state(r)), await r.evaluate(() => window.__hidden));
const nj = await b.newContext({ javaScriptEnabled: false });
const q = await nj.newPage(); await q.goto(base + "/en", { waitUntil: "load" });
console.log("no-JS /en", JSON.stringify(await state(q)));
await b.close();
