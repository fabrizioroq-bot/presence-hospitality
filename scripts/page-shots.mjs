// Full-page screenshots of every public page, EN + NL, desktop + mobile (design reviews).
// Usage: node scripts/page-shots.mjs <base> <out-dir>
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [base, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const PAGES = {
  home: { en: "/en", nl: "/nl" },
  solution: { en: "/en/solution", nl: "/nl/oplossing" },
  packages: { en: "/en/packages", nl: "/nl/pakketten" },
  onboarding: { en: "/en/onboarding", nl: "/nl/onboarding" },
  faq: { en: "/en/faq", nl: "/nl/faq" },
  demo: { en: "/en/demo", nl: "/nl/demo" },
  about: { en: "/en/about", nl: "/nl/over-ons" },
};
const DEV = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
};
const b = await chromium.launch({ channel: "chrome" });
for (const [dev, opts] of Object.entries(DEV)) {
  for (const [name, paths] of Object.entries(PAGES)) {
    for (const locale of ["en", "nl"]) {
      const p = await b.newPage({ ...opts, reducedMotion: "reduce" });
      await p.goto(`${base}${paths[locale]}?nointro`, { waitUntil: "networkidle" });
      // Scroll through once so lazy images and reveals are in their final state.
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
        scrollTo(0, 0);
      });
      await p.waitForTimeout(1500);
      await p.screenshot({ path: `${out}/${name}-${locale}-${dev}.jpg`, fullPage: true, type: "jpeg", quality: 62 });
      await p.close();
    }
  }
}
await b.close();
console.log("done");
