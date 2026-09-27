"use client";

import { useEffect } from "react";

/**
 * Day → night: publishes the page scroll progress as `--dusk` (0 at the top, 1 at the bottom) in
 * 1/60 steps. globals.css mixes the mist and night canvases towards their dusk tones with it
 * (both ends AA-checked; browsers without color-mix keep the day colours).
 */
export function DayNight() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const q = Math.round(p * 60) / 60;
      if (q !== last) {
        last = q;
        root.style.setProperty("--dusk", String(q));
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, []);
  return null;
}
