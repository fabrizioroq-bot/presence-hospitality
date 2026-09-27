// Intro loader behaviour: duration cap, skip, reduced motion, once per session, not on page
// transitions, and the page rendered behind it (LCP candidate painted while the intro shows).
import { chromium, devices } from "playwright";
const base = process.argv[2] ?? "http://localhost:3100";
const b = await chromium.launch({ channel: "chrome" });
const run = async (label, opts, fn) => {
  const ctx = await b.newContext(opts);
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    window.__t = {};
    addEventListener("ph:intro-done", () => (window.__t.done = Math.round(performance.now())));
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__t.lcp = Math.round(e.startTime)))).observe({ type: "largest-contentful-paint", buffered: true });
  });
  console.log(label.padEnd(34), await fn(p));
  await ctx.close();
};
const desk = { viewport: { width: 1440, height: 900 } };
await run("desktop: duration", desk, async (p) => {
  await p.goto(base + "/en", { waitUntil: "commit" });
  await p.waitForTimeout(300);
  const during = await p.evaluate(() => ({ intro: !!document.getElementById("ph-intro"), h1Painted: !!document.querySelector("h1")?.getBoundingClientRect().height }));
  await p.waitForTimeout(2600);
  return { ...during, doneAt: await p.evaluate(() => window.__t.done), lcp: await p.evaluate(() => window.__t.lcp) };
});
await run("desktop: click to skip at 400 ms", desk, async (p) => {
  await p.goto(base + "/en", { waitUntil: "commit" });
  await p.waitForTimeout(400);
  const t = await p.evaluate(() => Math.round(performance.now()));
  await p.mouse.click(700, 450);
  await p.waitForTimeout(700);
  return { clickedAt: t, doneAt: await p.evaluate(() => window.__t.done) };
});
await run("mobile: tap to skip", { ...devices["Pixel 7"] }, async (p) => {
  await p.goto(base + "/nl", { waitUntil: "commit" });
  await p.waitForTimeout(500);
  const t = await p.evaluate(() => Math.round(performance.now()));
  await p.touchscreen.tap(200, 400);
  await p.waitForTimeout(700);
  return { tappedAt: t, doneAt: await p.evaluate(() => window.__t.done) };
});
await run("reduced motion", { ...desk, reducedMotion: "reduce" }, async (p) => {
  await p.goto(base + "/en", { waitUntil: "commit" });
  await p.waitForTimeout(2500);
  return { doneAt: await p.evaluate(() => window.__t.done) };
});
await run("second page in session / transition", desk, async (p) => {
  await p.goto(base + "/en", { waitUntil: "load" });
  await p.waitForTimeout(2600);
  await p.click('header a[href="/en/solution"]');
  await p.waitForURL((u) => u.pathname === "/en/solution");
  const afterTransition = await p.evaluate(() => !!document.getElementById("ph-intro") || document.documentElement.classList.contains("intro"));
  await p.goto(base + "/en/faq", { waitUntil: "load" });
  const afterReload = await p.evaluate(() => !!document.getElementById("ph-intro") || document.documentElement.classList.contains("intro"));
  return { introOnTransition: afterTransition, introOnNextLoad: afterReload };
});
await b.close();
