/**
 * Inline <head> script (runs before first paint, no bundle needed):
 * 1. `html.rv` enables CSS reveals when motion is allowed (see Reveal.tsx).
 * 2. `html.intro` shows the intro loader on the first visit of the tab session.
 * 3. Records the first user interaction in `window.__phI`, so components that hydrate later
 *    (e.g. the hero WebGL) don't miss interactions that happened while the JS was downloading.
 * 4. Starts reveals at DOMContentLoaded (one IntersectionObserver; a MutationObserver picks up
 *    content added by client-side navigation). `data-rv-load` triggers wait for the intro to end.
 */
const boot = () => {
  const d = document;
  const h = d.documentElement;
  const w = window as Window & { __phI?: boolean };
  const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (motion) h.classList.add("rv");
  try {
    // `?nointro` (tests and audits) marks the intro as already seen for this tab.
    if (location.search.includes("nointro")) sessionStorage.setItem("ph-intro", "1");
    if (!sessionStorage.getItem("ph-intro")) {
      h.classList.add("intro");
      sessionStorage.setItem("ph-intro", "1");
    }
  } catch {}
  // Hero photo preview: ?hero=1..4 shows another variant (kept for the tab session).
  try {
    const hv = new URLSearchParams(location.search).get("hero");
    if (hv && /^[1-4]$/.test(hv)) sessionStorage.setItem("ph-hero", hv);
    const hs = sessionStorage.getItem("ph-hero");
    if (hs) h.dataset.hero = hs;
  } catch {}
  // Palette preview: ?palette=a|b (warm lavender/plum variants), ?palette=off resets.
  try {
    const pv = new URLSearchParams(location.search).get("palette");
    if (pv === "off") sessionStorage.removeItem("ph-palette");
    else if (pv === "a" || pv === "b") sessionStorage.setItem("ph-palette", pv);
    const ps = sessionStorage.getItem("ph-palette");
    if (ps) h.dataset.palette = ps;
  } catch {}
  w.__phI = false;
  const evs = ["pointerdown", "touchstart", "wheel", "keydown", "scroll", "mousemove"];
  const onI = () => {
    w.__phI = true;
    evs.forEach((e) => removeEventListener(e, onI, true));
    dispatchEvent(new Event("ph:interact"));
  };
  evs.forEach((e) => addEventListener(e, onI, { capture: true, passive: true }));
  if (!motion) return;

  const start = () => {
    h.classList.add("rv-on");
    const obs: Record<string, IntersectionObserver> = {};
    const show = (el: Element) => {
      let i = 0;
      const items = el.matches("[data-rv]") ? [el] : [];
      el.querySelectorAll("[data-rv]").forEach((it) => {
        if (it.closest("[data-rv-trigger]") === el) items.push(it);
      });
      items.forEach((it) => {
        const s = (it as HTMLElement).style;
        if (!s.getPropertyValue("--rv-i")) s.setProperty("--rv-i", String(i));
        i++;
      });
      requestAnimationFrame(() => el.setAttribute("data-in", ""));
    };
    const io = (amount: string) =>
      (obs[amount] ||= new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              obs[amount].unobserve(e.target);
              show(e.target);
            }
          }),
        // Start slightly before the element is fully in: reveals never lag behind the reader.
        { threshold: Math.min(+amount, 0.15), rootMargin: "0px 0px -6% 0px" },
      ));
    const waiting: Element[] = [];
    const seen = new WeakSet<Element>();
    const handle = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (el.hasAttribute("data-rv-load")) {
        if (h.classList.contains("intro")) waiting.push(el);
        else show(el);
      } else io(el.getAttribute("data-rv-amount") || "0.3").observe(el);
    };
    const SEL = "[data-rv-trigger]:not([data-in])";
    const scan = (n: Element | Document) => {
      if (n instanceof Element && n.matches(SEL)) handle(n);
      n.querySelectorAll(SEL).forEach(handle);
    };
    scan(d);
    new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n instanceof Element && scan(n)))).observe(d.body, { childList: true, subtree: true });
    addEventListener("ph:intro-done", () => waiting.splice(0).forEach(show));
  };
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", start);
  else start();
};

export const BOOT_SCRIPT = `(${boot.toString()})()`;
