// Screenshot a section on emulated devices. Usage: node scripts/device-shot.mjs <base> <path> <selector> <outPrefix> [full=1]
import { chromium, webkit, devices } from "playwright";
const [base, path, selector, out, full = "1"] = process.argv.slice(2);
const targets = [
  ["ios-safari", webkit, devices["iPhone 15"]],
  ["android-chrome", chromium, { ...devices["Pixel 7"] }],
];
for (const [name, launcher, device] of targets) {
  const b = await launcher.launch(launcher === chromium ? { channel: "chrome" } : {});
  const ctx = await b.newContext({ ...device });
  const p = await ctx.newPage();
  await p.goto(base + path, { waitUntil: "networkidle" });
  const el = p.locator(selector).first();
  const box = await el.boundingBox();
  for (let y = 0; y < (box?.y ?? 0) + (box?.height ?? 0); y += 300) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(60); }
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(1500);
  const h = Math.round((await el.boundingBox())?.height ?? 0);
  const vw = device.viewport.width, vh = device.viewport.height;
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (full === "1") await el.screenshot({ path: `${out}-${name}.png` });
  else await p.screenshot({ path: `${out}-${name}.png` });
  console.log(`${name} (${vw}×${vh}): section height ${h}px = ${(h / vh).toFixed(1)} screens${overflow > 0 ? ` | OVERFLOW ${overflow}px` : ""}`);
  await b.close();
}
