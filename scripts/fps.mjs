// Measures rAF frame rate on the hero after the hologram has formed (production server).
import { chromium } from "playwright";
const url = process.env.URL ?? "http://localhost:3100/en";
const b = await chromium.launch({ channel: "chrome", headless: process.env.HEADED ? false : true, args: ["--ignore-gpu-blocklist", "--enable-gpu-rasterization"] });
for (const [label, vp, touch] of [["desktop 1440", { width: 1440, height: 900 }, false], ["mobile 390 (touch)", { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  if (touch) await p.evaluate(() => window.dispatchEvent(new Event("touchstart")));
  else await p.mouse.move(vp.width * 0.7, 300);
  await p.waitForFunction(() => document.querySelector("#top")?.getAttribute("data-webgl") === "ready", null, { timeout: 15000 });
  await p.waitForTimeout(3000);
  const fps = await p.evaluate(() => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(Math.round(n / ((performance.now() - t0) / 1000))); };
    requestAnimationFrame(f);
  }));
  const gpu = await p.evaluate(() => { const gl = document.createElement("canvas").getContext("webgl2"); const e = gl?.getExtension("WEBGL_debug_renderer_info"); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : "unknown"; });
  console.log(`${label}: ${fps} fps  (renderer: ${gpu})`);
  await ctx.close();
}
await b.close();
