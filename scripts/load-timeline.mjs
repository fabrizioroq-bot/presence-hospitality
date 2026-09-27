// Load timeline, cold cache + throttling: when does each section become ready relative to when
// the user reaches it? Usage: node scripts/load-timeline.mjs <base> <path> <desktop|mobile> [out.json]
// Network: "Slow 4G" (Lighthouse mobile preset: 150 ms RTT, 1.6 Mbps down, 750 kbps up).
// Mobile also gets 4× CPU throttling. A user moves the mouse / touches after 1 s, then scrolls
// section by section (one every 2.5 s). Everything is timed from navigation start.
import { chromium, devices } from "playwright";
import { writeFileSync } from "node:fs";
const [base, path = "/en", profile = "desktop", out] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome" });
const ctx = await b.newContext(profile === "mobile" ? { ...devices["Pixel 7"] } : { viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
if (profile === "mobile") await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

await p.addInitScript(() => {
  const T = (window.__tl = { events: [], shifts: [], lcp: [], fonts: [] });
  const now = () => Math.round(performance.now());
  const where = (el) => {
    const s = el.closest?.("section[id], footer, header");
    return s ? (s.id || s.tagName.toLowerCase()) : "?";
  };
  new PerformanceObserver((l) => l.getEntries().forEach((e) => T.events.push({ t: Math.round(e.startTime), kind: e.name }))).observe({ type: "paint", buffered: true });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => T.lcp.push({ t: Math.round(e.startTime), el: e.element ? `${e.element.tagName}.${(e.element.className || "").toString().slice(0, 30)} in ${where(e.element)}` : "?" }))).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) =>
    l.getEntries().forEach((e) => {
      if (e.hadRecentInput) return;
      T.shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), src: (e.sources || []).map((s) => (s.node ? `${s.node.nodeName}${s.node.id ? "#" + s.node.id : ""}.${(s.node.className || "").toString().slice(0, 24)} in ${s.node.closest ? where(s.node) : "?"}` : "?")).slice(0, 3) });
    }),
  ).observe({ type: "layout-shift", buffered: true });
  document.fonts.addEventListener("loadingdone", (e) => e.fontfaces.forEach((f) => T.fonts.push({ t: now(), f: `${f.family.slice(0, 22)} ${f.weight} ${f.style}` })));
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      const el = m.target;
      if (m.type === "attributes" && m.attributeName === "data-webgl" && el.getAttribute("data-webgl") === "ready") T.events.push({ t: now(), kind: "webgl-ready", sec: where(el) });
      if (m.type === "attributes" && m.attributeName === "data-in") T.events.push({ t: now(), kind: "reveal", sec: where(el) });
      if (m.type === "childList") m.addedNodes.forEach((n) => { if (n.nodeName === "CANVAS" && n.hasAttribute?.("data-engine")) T.events.push({ t: now(), kind: "canvas-mounted", sec: where(n) }); if (n.querySelectorAll) n.querySelectorAll("canvas[data-engine]").forEach((c) => T.events.push({ t: now(), kind: "canvas-mounted", sec: where(c) })); });
    }
  });
  document.addEventListener("DOMContentLoaded", () => { T.events.push({ t: now(), kind: "DOMContentLoaded" }); mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-webgl", "data-in"] }); });
  window.addEventListener("load", () => T.events.push({ t: now(), kind: "load" }));
  // Story poster → WebGL swap (opacity of the SVG poster wrapper).
  let storyLogged = false;
  setInterval(() => {
    const c = document.querySelector("#how-it-works canvas[data-engine]");
    if (c && !storyLogged) { const w = c.closest("figure")?.querySelector(".transition-opacity"); if (w && getComputedStyle(w).opacity === "0") { storyLogged = true; T.events.push({ t: now(), kind: "webgl-ready", sec: "how-it-works" }); } }
  }, 100);
});

await p.goto(base + path, { waitUntil: "commit", timeout: 90000 });
await p.waitForTimeout(1000);
if (profile === "mobile") await p.touchscreen.tap(5, 300).catch(() => {});
else await p.mouse.move(700, 450, { steps: 4 });
await p.waitForLoadState("load", { timeout: 90000 }).catch(() => {});
await p.waitForTimeout(1500);
// Scroll section by section like a reader.
const secs = await p.evaluate(() => [...document.querySelectorAll("main section[id]")].filter((s) => !s.parentElement.closest("section[id]")).map((s) => s.id));
const enters = [];
for (const id of secs) {
  const tEnter = await p.evaluate((id) => { const el = document.getElementById(id); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.25); return Math.round(performance.now()); }, id);
  enters.push({ sec: id, t: tEnter });
  await p.waitForTimeout(id === "how-it-works" ? 4000 : 2500);
}
await p.waitForTimeout(1500);
const tl = await p.evaluate(() => window.__tl);
const res = await p.evaluate(() => performance.getEntriesByType("resource").map((r) => ({ n: r.name.replace(location.origin, "").slice(0, 70), start: Math.round(r.startTime), end: Math.round(r.responseEnd), kb: Math.round(r.encodedBodySize / 1024), type: r.initiatorType })));
await b.close();

const firstOf = (kind, sec) => tl.events.filter((e) => e.kind === kind && (!sec || e.sec === sec)).map((e) => e.t).sort((a, c) => a - c)[0];
const fcp = firstOf("first-contentful-paint");
console.log(`\n=== ${base}${path} · ${profile} · cold cache · slow 4G${profile === "mobile" ? " · 4× CPU" : ""}`);
console.log(`FCP ${fcp} ms · LCP ${tl.lcp.at(-1)?.t} ms (${tl.lcp.at(-1)?.el}) · DOMContentLoaded ${firstOf("DOMContentLoaded")} · load ${firstOf("load")}`);
console.log(`Fonts loaded: ${tl.fonts.map((f) => `${f.f} @${f.t}`).join(" · ") || "(none reported)"}`);
const cls = tl.shifts.reduce((a, s) => a + s.v, 0);
console.log(`Layout shifts: total ${cls.toFixed(3)}${tl.shifts.length ? " → " + tl.shifts.map((s) => `@${s.t} ${s.v} ${s.src.join(", ")}`).join(" | ") : ""}`);
const heroReady = firstOf("webgl-ready", "top");
console.log(`Hero 3D: canvas mounted @${firstOf("canvas-mounted", "top") ?? "-"} · painted @${heroReady ?? "never"}`);
console.log("Section            reached   first reveal (+ms)   3D painted (+ms)");
for (const { sec, t } of enters) {
  const rev = tl.events.filter((e) => e.kind === "reveal" && e.sec === sec).map((e) => e.t);
  const firstRev = rev.length ? Math.min(...rev) : null;
  const gl = firstOf("webgl-ready", sec);
  const fmt = (v) => (v == null ? "—" : v <= t ? `ready before (${v})` : `+${v - t}`);
  console.log(`${sec.padEnd(18)} ${String(t).padStart(6)}   ${fmt(firstRev).padEnd(20)} ${sec === "top" ? "" : fmt(gl)}`);
}
const big = res.filter((r) => r.kb >= 20 || /hologram|woff2/.test(r.n)).sort((a, c) => a.start - c.start);
console.log("Key resources (start→end ms, KB):");
for (const r of big) console.log(`  ${String(r.start).padStart(6)}→${String(r.end).padStart(6)}  ${String(r.kb).padStart(4)} KB  ${r.n}`);
if (out) writeFileSync(out, JSON.stringify({ base, path, profile, tl, enters, res }, null, 1));
