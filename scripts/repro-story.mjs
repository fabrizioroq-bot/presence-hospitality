// Reproduces "How it works" loading issues on desktop: navbar jump right after load, and a fast scroll.
// Usage: node scripts/repro-story.mjs <baseUrl> <outDir> [engine=chromium|webkit]
import { chromium, webkit } from "playwright";
const [base, out, engine = "chromium"] = process.argv.slice(2);
const launcher = engine === "webkit" ? webkit : chromium;
const b = await launcher.launch(engine === "webkit" ? {} : { channel: "chrome" });
const log = [];
async function run(name, act) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => log.push(`${name} pageerror ${e.message.slice(0, 160)}`));
  p.on("console", (m) => { if (m.type() === "error") log.push(`${name} console ${m.text().slice(0, 160)}`); });
  await p.goto(base + "/en", { waitUntil: "domcontentloaded" });
  await act(p);
  for (const t of [300, 1200, 3000]) {
    await p.waitForTimeout(t === 300 ? 300 : t - (t === 1200 ? 300 : 1200));
    const state = await p.evaluate(() => {
      const fig = document.querySelector("#how-it-works figure");
      const canvas = fig?.querySelector("canvas");
      const poster = fig?.querySelector(":scope > div.transition-opacity");
      return {
        pinned: Boolean(fig),
        canvas: Boolean(canvas),
        posterOpacity: poster ? getComputedStyle(poster).opacity : "n/a",
        y: Math.round(window.scrollY),
      };
    });
    log.push(`${name} @${t}ms ${JSON.stringify(state)}`);
    await p.screenshot({ path: `${out}/${engine}-${name}-${t}ms.png` });
  }
  await ctx.close();
}
// A) Navbar link immediately after load
await run("navbar-jump", async (p) => { await p.waitForTimeout(400); await p.click('header nav a[href="#how-it-works"]'); });
// B) Fast wheel scroll straight into the story
await run("fast-scroll", async (p) => {
  await p.waitForTimeout(400);
  const top = await p.evaluate(() => document.querySelector("#how-it-works").getBoundingClientRect().top + scrollY);
  await p.mouse.move(700, 450);
  for (let y = 0; y < top + 1400; y += 1200) await p.mouse.wheel(0, 1200);
});
console.log(log.join("\n"));
await b.close();
