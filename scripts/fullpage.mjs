// Full-page screenshots of the given paths on iPhone 15 (WebKit) and desktop 1440 (Chrome).
import { webkit, chromium, devices } from "playwright";
const [base, out, ...paths] = process.argv.slice(2);
for (const [name, launcher, opts] of [["mobile", webkit, { ...devices["iPhone 15"] }], ["desktop", chromium, { viewport: { width: 1440, height: 900 } }]]) {
  const b = await launcher.launch(launcher === chromium ? { channel: "chrome" } : {});
  const ctx = await b.newContext(opts);
  const p = await ctx.newPage();
  for (const path of paths) {
    await p.goto(base + path, { waitUntil: "networkidle" });
    for (let y = 0, H = await p.evaluate(() => document.body.scrollHeight); y < H; y += 500) { await p.evaluate((yy) => scrollTo(0, yy), y); await p.waitForTimeout(40); }
    await p.evaluate(() => scrollTo(0, 0));
    await p.waitForTimeout(800);
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    const f = `${out}/${path.replace(/\//g, "_").replace(/^_/, "") || "root"}-${name}.png`;
    await p.screenshot({ path: f, fullPage: true });
    console.log(`${name.padEnd(8)} ${path.padEnd(20)} ${h}px  (${(h / (opts.viewport?.height ?? 900)).toFixed(1)} screens)  → ${f}`);
  }
  await b.close();
}
