// Before/after screenshots for design reviews: hero, a light section, a dark section, packages,
// the demo form and the footer, on desktop + mobile, EN + NL.
// Usage: node scripts/compare-shots.mjs <base> <out-dir> [locales=en,nl] [devices=desktop,mobile]
// Base may be a protected preview: set VERCEL_BYPASS to a protection-bypass token if needed.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [base, out, locales = "en,nl", devs = "desktop,mobile"] = process.argv.slice(2);
if (!base || !out) throw new Error("usage: compare-shots.mjs <base> <out-dir>");
mkdirSync(out, { recursive: true });

const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const PATHS = {
  en: { home: "/en", packages: "/en/packages", demo: "/en/demo" },
  nl: { home: "/nl", packages: "/nl/pakketten", demo: "/nl/demo" },
};
// [file name, page, selector to scroll to (null = top, "bottom" = page end), offset px]
const SHOTS = [
  ["1-hero", "home", null, 0],
  ["2-light-benefits", "home", "#benefits", -40],
  ["3-dark-problem", "home", "#problem", 120],
  ["4-packages-board", "packages", "main > header", "after"],
  ["5-packages-pricing", "packages", "#pricing", -40],
  ["6-form", "demo", "form", -120],
  ["7-footer", "home", "bottom", 0],
];

const b = await chromium.launch({ channel: "chrome" });
for (const dev of devs.split(",")) {
  for (const locale of locales.split(",")) {
    const ctx = await b.newContext({ ...DEVICES[dev], reducedMotion: "no-preference" });
    if (process.env.VERCEL_BYPASS) await ctx.setExtraHTTPHeaders({ "x-vercel-protection-bypass": process.env.VERCEL_BYPASS });
    const p = await ctx.newPage();
    let current = "";
    for (const [name, page, sel, off] of SHOTS) {
      const path = PATHS[locale][page];
      if (path !== current) {
        await p.goto(`${base}${path}?nointro`, { waitUntil: "networkidle" });
        current = path;
        await p.waitForTimeout(1500);
      }
      await p.evaluate(
        ([s, o]) => {
          if (s === null) return window.scrollTo(0, 0);
          if (s === "bottom") return window.scrollTo(0, document.documentElement.scrollHeight);
          const el = document.querySelector(s);
          if (!el) return;
          const r = el.getBoundingClientRect();
          window.scrollTo(0, (o === "after" ? r.bottom : r.top + o) + scrollY);
        },
        [sel, off],
      );
      await p.waitForTimeout(2200);
      await p.screenshot({ path: `${out}/${name}-${locale}-${dev}.jpg`, type: "jpeg", quality: 82 });
    }
    await ctx.close();
  }
}
await b.close();
console.log("done");
