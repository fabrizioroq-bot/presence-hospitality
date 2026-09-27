import { WORDMARK } from "./wordmark-points";

/**
 * Intro loader (first visit of a tab session; `html.intro` is set by the boot script).
 * Holographic dots rise from an emitter line and assemble the "Presence" wordmark while the page,
 * fonts and hero assets load behind it. Ends when the page is ready (min 1.1 s) or at 1.5 s at the
 * latest, then dissolves upwards in 350 ms (≤ ~1.85 s total). Click, tap, wheel or a key skips it.
 * Reduced motion: static wordmark and a plain fade. Fires `ph:intro-done` for the page underneath.
 */
const intro = (P: { n: number; aspect: number; b64: string }, caption: string) => {
  const h = document.documentElement;
  if (!h.classList.contains("intro") || !document.body) return;
  // Built here, outside React's tree (React skips foreign nodes in <body> when hydrating).
  // A custom element: never confused with React's own nodes during hydration.
  const el = document.createElement("ph-intro");
  el.id = "ph-intro";
  el.setAttribute("aria-hidden", "true");
  const cv = document.createElement("canvas");
  const cap = document.createElement("span");
  cap.className = "ph-intro-caption";
  cap.textContent = caption;
  el.append(cv, cap);
  document.body.prepend(el);
  const g = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  const MIN = reduce ? 500 : 1100;
  const MAX = reduce ? 1200 : 1500;
  const OUT = reduce ? 300 : 350;
  let fontsOk = false;
  let loaded = document.readyState === "complete";
  let heroOk = false;
  let ending = 0;
  let raf = 0;
  document.fonts.ready.then(() => (fontsOk = true));
  addEventListener("load", () => (loaded = true), { once: true });
  addEventListener("ph:hero-ready", () => (heroOk = true), { once: true });

  // Targets
  const bin = atob(P.b64);
  // Capped resolution: the canvas is redrawn every frame, keep it cheap on phones and software GL.
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  let W = 0;
  let H = 0;
  let ww = 0;
  let wx = 0;
  let wy = 0;
  const size = () => {
    W = cv.width = Math.round(innerWidth * dpr);
    H = cv.height = Math.round(innerHeight * dpr);
    ww = Math.min(innerWidth * 0.74, 760) * dpr;
    wx = (W - ww) / 2;
    wy = H / 2 - ww / P.aspect / 2 - 12 * dpr;
    cap.style.top = `${(wy + ww / P.aspect) / dpr + 26}px`;
  };
  size();
  addEventListener("resize", size);
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  // Colour groups (drawn as one path each → ~18 fills per frame instead of one per dot):
  // 6 steps of deep blue → holo cyan across the word, plus warm sparks; 3 twinkle phases.
  const COLS = [0, 1, 2, 3, 4, 5].map((k) => {
    const x = k / 5;
    return `rgb(${Math.round(lerp(23, 10, x))},${Math.round(lerp(71, 123, x))},${Math.round(lerp(166, 163, x))})`;
  });
  COLS.push("#F5A94A");
  type Pt = { tx: number; ty: number; sx: number; sy: number; d: number; r: number };
  const groups: Pt[][] = Array.from({ length: COLS.length * 3 }, () => []);
  for (let i = 0; i < P.n; i++) {
    const tx = bin.charCodeAt(i * 2) / 255;
    const ty = bin.charCodeAt(i * 2 + 1) / 255;
    const c = rnd() < 0.05 ? 6 : Math.min(5, Math.floor(tx * 6));
    groups[c * 3 + Math.floor(rnd() * 3)].push({ tx, ty, sx: 0.5 + (rnd() - 0.5) * 0.5, sy: 1.15 + rnd() * 0.25, d: tx * 180 + rnd() * 160, r: 0.8 + rnd() * 0.9 });
  }

  const draw = (now: number) => {
    const t = now - t0;
    g!.clearRect(0, 0, W, H);
    const k = ending ? Math.min(1, (now - ending) / OUT) : 0;
    const rad = (ww / 760) * 1.55;
    for (let gi = 0; gi < groups.length; gi++) {
      const ph = (gi % 3) * 2.1;
      g!.globalAlpha = Math.max(0, (0.8 + 0.2 * Math.sin(t / 220 + ph)) * (1 - k)); // twinkle per group
      g!.fillStyle = COLS[Math.floor(gi / 3)];
      g!.beginPath();
      for (const p of groups[gi]) {
        const f = reduce ? 1 : ease(Math.min(1, Math.max(0, (t - p.d) / 850)));
        const x = wx + lerp(p.sx * (W - wx * 2), p.tx * ww, f) + (reduce ? 0 : Math.sin(t / 300 + p.d) * (1 - f) * 18 * dpr);
        const y = wy + lerp(p.sy * H - wy, (p.ty * ww) / P.aspect, f) - (reduce ? 0 : k * k * (40 + p.d * 0.1) * dpr); // dissolve upwards
        const r = rad * p.r * (0.45 + 0.55 * f);
        g!.moveTo(x + r, y);
        g!.arc(x, y, r, 0, 6.283);
      }
      g!.fill();
    }
    g!.globalAlpha = 1;
    // Reduced motion: no 3D to wait for, just fonts + page.
    const ready = fontsOk && loaded && (heroOk || reduce);
    if (!ending && t >= MIN && (ready || (fontsOk && loaded && t >= 1300) || t >= MAX)) end();
    if (ending && k >= 1) return finish();
    raf = requestAnimationFrame(draw);
  };
  const end = () => {
    if (ending) return;
    ending = performance.now();
    el.classList.add("out");
    el.style.transitionDuration = OUT + "ms";
  };
  const finish = () => {
    cancelAnimationFrame(raf);
    h.classList.remove("intro");
    el.remove();
    removeEventListener("resize", size);
    dispatchEvent(new Event("ph:intro-done"));
  };
  const skip = () => end();
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach((e) => addEventListener(e, skip, { once: true, passive: true }));
  raf = requestAnimationFrame(draw);
  // Safety: never leave the page covered (e.g. rAF throttled in a background tab).
  setTimeout(() => {
    if (document.getElementById("ph-intro")) finish();
  }, MAX + OUT + 1500);
};

export const introScript = (caption: string) => `(${intro.toString()})(${JSON.stringify(WORDMARK)}, ${JSON.stringify(caption)})`;
