// Finds text blocks that visually overlap (e.g. parallax pushing a heading into a paragraph).
// Usage: node scripts/text-overlap.mjs <base> <minW> <maxW> <stepW> <path...>
// For every width, scrolls the page in 0.4-viewport steps (parallax settles) and checks every
// pair of visible text blocks in the viewport. Decorative (aria-hidden) and sr-only text is skipped.
import { chromium } from "playwright";
const [base, minW, maxW, stepW, ...paths] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
const hits = new Map();
for (const path of paths) {
  const p = await b.newPage({ viewport: { width: +minW, height: 800 } });
  await p.goto(base + path, { waitUntil: "networkidle" });
  for (let w = +minW; w <= +maxW; w += +stepW) {
    await p.setViewportSize({ width: w, height: 800 });
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(300);
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 320) {
      await p.evaluate((yy) => window.scrollTo(0, yy), y);
      await p.waitForTimeout(260);
      const found = await p.evaluate(() => {
        const SEL = "h1,h2,h3,h4,p,li,dt,dd,label,figcaption,blockquote,[class*='text-display'],[class*='text-heading']";
        const skip = (el) => el.closest("[aria-hidden='true'],.sr-only,svg,canvas,[role='dialog'],header,footer select");
        const els = [...document.querySelectorAll(SEL)].filter((el) => {
          if (skip(el)) return false;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden") return false;
          // effective opacity (cross-faded layers such as the story captions count as hidden)
          let o = 1;
          for (let a = el; a && a !== document.documentElement; a = a.parentElement) o *= +getComputedStyle(a).opacity;
          if (o < 0.35) return false;
          // leaf-ish: skip if it contains another candidate
          return !el.querySelector(SEL);
        });
        const boxes = [];
        for (const el of els) {
          const r = document.createRange();
          r.selectNodeContents(el);
          const rects = [...r.getClientRects()].filter((q) => q.width > 2 && q.height > 2);
          if (!rects.length) continue;
          const bb = rects.reduce((a, q) => ({ l: Math.min(a.l, q.left), t: Math.min(a.t, q.top), r: Math.max(a.r, q.right), b: Math.max(a.b, q.bottom) }), { l: 1e9, t: 1e9, r: -1e9, b: -1e9 });
          if (bb.b < 0 || bb.t > innerHeight) continue;
          // an element fully clipped by an overflow-hidden ancestor (e.g. carousel off-screen) is skipped
          let clipped = false;
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const s = getComputedStyle(a);
            if (s.overflowX !== "visible" || s.overflowY !== "visible") {
              const ar = a.getBoundingClientRect();
              if (bb.l >= ar.right - 1 || bb.r <= ar.left + 1 || bb.t >= ar.bottom - 1 || bb.b <= ar.top + 1) { clipped = true; break; }
            }
          }
          if (clipped) continue;
          boxes.push({ el, rects, name: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 34) });
        }
        const out = [];
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const A = boxes[i], B = boxes[j];
            if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
            let ov = 0;
            for (const a of A.rects) for (const c of B.rects) {
              const x = Math.min(a.right, c.right) - Math.max(a.left, c.left);
              const yv = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
              if (x > 2 && yv > 2) ov = Math.max(ov, Math.round(yv));
            }
            if (ov) out.push(`"${A.name}" × "${B.name}" (${ov}px)`);
          }
        return out;
      });
      for (const f of found) {
        const k = `${path} ${f.replace(/\(\d+px\)/, "")}`;
        const e = hits.get(k) ?? { widths: new Set(), max: 0 };
        e.widths.add(w);
        e.max = Math.max(e.max, +f.match(/\((\d+)px\)/)[1]);
        hits.set(k, e);
      }
    }
  }
  await p.close();
}
if (!hits.size) console.log("no overlapping text");
for (const [k, e] of hits) console.log(`${k} up to ${e.max}px at widths ${[...e.widths].join(",")}`);
await b.close();
