"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { detectTier, hasWebGL2 } from "@/lib/perf-tier";
import { preloadHologram } from "@/lib/preload";
import { resetScroll, scrollToHash } from "@/lib/smooth-scroll";

const OUT_MS = 380;
const IN_MS = 520;

type Phase = "idle" | "out" | "in";

/**
 * Particle page transition. Intercepts clicks on internal links to another page: the page
 * dissolves under a mist veil with rising brand-coloured particles, the next route loads
 * client-side, and it re-forms as the veil lifts. Off for reduced motion (normal navigation).
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const started = useRef(0);
  const hashRef = useRef<string>("");
  const fromPath = useRef(pathname);

  const set = (p: Phase) => {
    phaseRef.current = p;
    started.current = performance.now();
    setPhase(p);
  };

  // Intercept internal page links (capture phase, before next/link's own handler).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (!/^\/(en|nl)(\/|$)/.test(url.pathname)) return; // public pages only (not /dashboard)
      if (url.pathname === location.pathname) return; // same page: in-page anchors scroll smoothly
      e.preventDefault();
      e.stopPropagation();
      if (phaseRef.current !== "idle") return;
      hashRef.current = url.hash;
      fromPath.current = location.pathname;
      set("out");
      window.setTimeout(() => router.push(url.pathname + url.search, { scroll: false }), OUT_MS);
      // Safety: never leave the veil up if navigation fails.
      window.setTimeout(() => {
        if (phaseRef.current === "out") set("idle");
      }, 6000);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // Preload the next page on intent (hover, touch, keyboard focus) for every internal link,
  // including plain <a> (footer, CTAs) that next/link doesn't prefetch: its route data and code,
  // plus the hero hologram when the link goes to Home.
  useEffect(() => {
    const done = new Set<string>();
    const onIntent = (e: Event) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/^\/(en|nl)(\/|$)/.test(url.pathname) || url.pathname === location.pathname) return;
      if (done.has(url.pathname)) return;
      done.add(url.pathname);
      router.prefetch(url.pathname);
      if (/^\/(en|nl)\/?$/.test(url.pathname) && hasWebGL2()) preloadHologram(detectTier());
    };
    const opts = { capture: true, passive: true } as const;
    document.addEventListener("pointerover", onIntent, opts);
    document.addEventListener("touchstart", onIntent, opts);
    document.addEventListener("focusin", onIntent, opts);
    return () => {
      document.removeEventListener("pointerover", onIntent, opts);
      document.removeEventListener("touchstart", onIntent, opts);
      document.removeEventListener("focusin", onIntent, opts);
    };
  }, [router]);

  // New route rendered → position it, then lift the veil.
  useEffect(() => {
    if (phaseRef.current !== "out" || pathname === fromPath.current) return;
    requestAnimationFrame(() => {
      if (hashRef.current) scrollToHash(hashRef.current, { immediate: true });
      else {
        resetScroll();
        // Land keyboard + screen-reader focus at the start of the new page.
        document.getElementById("main")?.focus({ preventScroll: true });
      }
      set("in");
      window.setTimeout(() => set("idle"), IN_MS);
    });
  }, [pathname]);

  // Veil + particles.
  useEffect(() => {
    const c = canvas.current;
    if (!c || phase === "idle") return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = (c.width = Math.round(innerWidth * dpr));
    const h = (c.height = Math.round(innerHeight * dpr));
    const N = innerWidth < 768 ? 70 : 140;
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: h * (0.3 + Math.random() * 0.9),
      r: (1 + Math.random() * 2.4) * dpr,
      v: (0.6 + Math.random() * 1.4) * h,
      warm: Math.random() < 0.12,
      ph: Math.random() * Math.PI * 2,
    }));
    let raf = 0;
    const t0 = performance.now();
    const draw = (now: number) => {
      const p = phaseRef.current;
      const dur = p === "out" ? OUT_MS : IN_MS;
      const k = Math.min(1, (now - started.current) / dur);
      const veil = p === "out" ? k : 1 - k;
      const secs = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      // Mist veil with a soft sky glow.
      const g = ctx.createRadialGradient(w * 0.7, h * 0.2, 0, w * 0.7, h * 0.2, Math.max(w, h));
      g.addColorStop(0, `rgba(141,179,223,${0.9 * veil})`);
      g.addColorStop(1, `rgba(211,218,225,${veil})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // Particles rising (dissolve), fading with the veil on the way in.
      const alpha = p === "out" ? Math.min(1, k * 2) : 1 - k;
      for (const q of parts) {
        const y = q.y - q.v * secs * 0.55;
        const x = q.x + Math.sin(secs * 3 + q.ph) * 6 * dpr;
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = q.warm ? "#F5A94A" : "#2F7FD0";
        ctx.beginPath();
        ctx.arc(x, ((y % h) + h) % h, q.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={phase === "idle" ? "hidden" : "pointer-events-auto fixed inset-0 z-[90] h-full w-full"}
    />
  );
}
