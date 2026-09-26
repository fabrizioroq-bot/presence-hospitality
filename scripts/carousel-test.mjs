// Tests the mobile story carousel: swipe, next button, dots; screenshots a few steps.
import { webkit, chromium, devices } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
for (const [name, launcher, device] of [["ios-safari", webkit, devices["iPhone 15"]], ["android-chrome", chromium, devices["Pixel 7"]]]) {
  const b = await launcher.launch(launcher === chromium ? { channel: "chrome" } : {});
  const ctx = await b.newContext({ ...device });
  const p = await ctx.newPage();
  await p.goto(base + "/en", { waitUntil: "networkidle" });
  const region = p.locator('#how-it-works [aria-roledescription="carousel"]');
  await region.scrollIntoViewIfNeeded();
  const active = () => p.$eval('#how-it-works [aria-roledescription="carousel"] [aria-current="step"]', (b) => b.getAttribute("aria-label"));
  // Swipe (horizontal scroll of the slide track, as a finger swipe does)
  const trackBox = await p.locator('#how-it-works [aria-roledescription="carousel"] .snap-x').boundingBox();
  await p.touchscreen?.tap?.(trackBox.x + 20, trackBox.y + 20).catch(() => {});
  await p.evaluate(() => { const t = document.querySelector('#how-it-works [aria-roledescription="carousel"] .snap-x'); t.scrollTo({ left: t.clientWidth, behavior: "instant" }); });
  await p.waitForTimeout(1600);
  const afterSwipe = await active();
  // Next button ×3 → step 5
  for (let k = 0; k < 3; k++) { await p.click('#how-it-works button[aria-label="Next step"]'); await p.waitForTimeout(900); }
  await p.waitForTimeout(1200);
  const afterNext = await active();
  await region.screenshot({ path: `screenshots/fix-1/after/carousel-step5-${name}.png` });
  // Dot → step 1
  await p.click('#how-it-works button[aria-label="Go to step 1"]');
  await p.waitForTimeout(2000);
  const afterDot = await active();
  await region.screenshot({ path: `screenshots/fix-1/after/carousel-step1-${name}.png` });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`${name}: swipe → "${afterSwipe}" | 3× next → "${afterNext}" | dot 1 → "${afterDot}" | page overflow ${overflow}px`);
  await b.close();
}
