"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type Mood = "mist" | "night";

/**
 * Slow drifting motes on a 2D canvas, behind section content. Animates only while the
 * section is on screen; fewer motes and 30 fps on touch devices; nothing for reduced motion.
 */
export function AmbientDust({
  mood = "mist",
  density = 1,
  className,
}: {
  mood?: Mood;
  density?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5);
    const frameGap = coarse ? 1000 / 30 : 0;

    // Pre-rendered glow sprites (cool + warm) keep each frame cheap.
    const sprite = (rgb: string, alpha: number) => {
      const s = document.createElement("canvas");
      s.width = s.height = 64;
      const g = s.getContext("2d")!;
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, `rgba(${rgb},${alpha})`);
      grd.addColorStop(0.35, `rgba(${rgb},${alpha * 0.45})`);
      grd.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
      return s;
    };
    const cool = mood === "night" ? sprite("191,224,255", 0.9) : sprite("90,168,245", 0.55);
    const warm = sprite("245,169,74", mood === "night" ? 0.85 : 0.6);

    type Mote = { x: number; y: number; r: number; vy: number; ph: number; depth: number; warm: boolean };
    let motes: Mote[] = [];
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const count = Math.round(((w * h) / 26000) * density * (coarse ? 0.5 : 1));
      motes = Array.from({ length: Math.min(count, coarse ? 30 : 64) }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: 3 + depth * 9,
          vy: 4 + depth * 10, // px per second, upward
          ph: Math.random() * Math.PI * 2,
          depth,
          warm: Math.random() < 0.08,
        };
      });
    };

    let mx = 0;
    let tmx = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") tmx = (e.clientX / window.innerWidth) * 2 - 1;
    };

    let raf = 0;
    let last = 0;
    let running = false;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (frameGap && now - last < frameGap) return;
      const dt = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      mx += (tmx - mx) * 0.03;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y -= m.vy * dt;
        if (m.y < -20) {
          m.y = h + 20;
          m.x = Math.random() * w;
        }
        const sway = Math.sin(now / 4000 + m.ph) * 10 * m.depth;
        const x = m.x + sway - mx * 14 * m.depth;
        const tw = 0.55 + 0.45 * Math.sin(now / 1600 + m.ph * 3);
        ctx.globalAlpha = (0.25 + 0.55 * m.depth) * tw;
        const s = m.r * 2;
        ctx.drawImage(m.warm ? warm : cool, x - m.r, m.y - m.r, s, s);
      }
    };
    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()));
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
    };
  }, [mood, density]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-[5] h-full w-full motion-reduce:hidden", className)}
    />
  );
}
