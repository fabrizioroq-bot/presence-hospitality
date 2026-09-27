// Verifies story-carousel autoplay on emulated iOS Safari / Android Chrome.
import { webkit, chromium, devices } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const stepOf = (p) => p.$eval('#how-it-works [aria-roledescription="carousel"] [aria-current="step"]', (b) => Number(b.getAttribute("aria-label").match(/\d+/)[0]));
for (const [name, launcher, device] of [["ios-safari", webkit, devices["iPhone 15"]], ["android-chrome", chromium, devices["Pixel 7"]]]) {
  const b = await launcher.launch(launcher === chromium ? { channel: "chrome" } : {});
  const ctx = await b.newContext({ ...device });
  const p = await ctx.newPage();
  await p.goto(base + "/en", { waitUntil: "networkidle" });
  const region = p.locator('#how-it-works [aria-roledescription="carousel"]');
  await region.scrollIntoViewIfNeeded();
  await p.waitForFunction(() => document.querySelector('#how-it-works [aria-roledescription="carousel"]')?.dataset.autoplay === "on");
  const seq = [await stepOf(p)];
  await p.waitForTimeout(1500);
  for (let k = 0; k < 3; k++) { await p.waitForTimeout(3300); seq.push(await stepOf(p)); }
  // Touch pauses: tap the scene, then 4 s later the step must not have changed
  await p.waitForTimeout(1200); // let any step transition finish before tapping
  await p.locator('#how-it-works [aria-roledescription="carousel"] > div').first().tap();
  const atTap = await stepOf(p);
  await p.waitForTimeout(4000);
  const after4s = await stepOf(p);
  // Resumes after ~6 s idle (+ one 3 s step)
  await p.waitForTimeout(5500);
  const resumed = await stepOf(p);
  // Out of view: scroll away for 7 s → must not advance
  await p.evaluate(() => window.scrollTo(0, 0));
  const beforeAway = await stepOf(p);
  await p.waitForTimeout(7000);
  const afterAway = await stepOf(p);
  // Loop: jump to step 6 via dot, wait for idle resume + step → back to 1
  await region.scrollIntoViewIfNeeded();
  await p.locator('#how-it-works button[aria-label="Go to step 6"]').click();
  await p.waitForTimeout(6000 + 3000 + 800);
  const looped = await stepOf(p);
  console.log(`${name}: autoplay ${seq.join("→")} | tap at ${atTap}, +4s ${after4s} (paused ${atTap === after4s}) | resumed → ${resumed} | off-screen ${beforeAway}→${afterAway} (held ${beforeAway === afterAway}) | after step 6 → ${looped}`);
  await b.close();
  // Reduced motion: no autoplay
  const b2 = await launcher.launch(launcher === chromium ? { channel: "chrome" } : {});
  const c2 = await b2.newContext({ ...device, reducedMotion: "reduce" });
  const p2 = await c2.newPage();
  await p2.goto(base + "/en", { waitUntil: "networkidle" });
  await p2.locator('#how-it-works [aria-roledescription="carousel"]').scrollIntoViewIfNeeded();
  const r0 = await stepOf(p2);
  await p2.waitForTimeout(7000);
  console.log(`${name} (reduced motion): step ${r0} → ${await stepOf(p2)} after 7 s, progress bar present: ${await p2.locator("#how-it-works .carousel-progress").count() > 0}`);
  await b2.close();
}
