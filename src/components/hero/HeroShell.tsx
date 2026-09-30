"use client";

import { createContext, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { spring, trackScroll, Value } from "@/lib/anim";
import { useReducedMotion } from "@/lib/hooks";

type Ctx = { sx: Value; sy: Value; progress: Value; enabled: boolean };
const ParallaxCtx = createContext<Ctx | null>(null);

/**
 * Client shell for the hero: pointer + scroll state for the depth parallax of its children.
 * (The hero shows a photograph now; the WebGL hologram lives in the Experience section.)
 */
export function HeroShell({ children, ...props }: ComponentProps<"section"> & { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Scroll progress through the hero + spring-smoothed pointer (-1..1), shared with <Parallax>.
  const [vals] = useState(() => ({ progress: new Value(0), sx: new Value(0), sy: new Value(0) }));
  const { progress, sx, sy } = vals;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return trackScroll(el, ["start start", "end start"], (v) => progress.set(v));
  }, [progress]);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || reduce) return;
    const spX = spring((v) => sx.set(v), { stiffness: 40, damping: 18, mass: 1 });
    const spY = spring((v) => sy.set(v), { stiffness: 40, damping: 18, mass: 1 });
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      spX.set((e.clientX / window.innerWidth) * 2 - 1);
      spY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      spX.stop();
      spY.stop();
    };
  }, [sx, sy, reduce]);

  return (
    <ParallaxCtx.Provider value={{ sx, sy, progress, enabled: !reduce }}>
      <section ref={ref} {...props}>
        {children}
      </section>
    </ParallaxCtx.Provider>
  );
}

/** Moves its children with the pointer and scroll by `mouse` px and `scroll` px. */
export function Parallax({
  children,
  className,
  mouse = [0, 0],
  scroll = 0,
}: {
  children: ReactNode;
  className?: string;
  mouse?: [number, number];
  scroll?: number;
}) {
  const ctx = useContext(ParallaxCtx);
  if (!ctx) throw new Error("Parallax must be used inside HeroShell");
  const ref = useRef<HTMLDivElement>(null);
  const [mx, my] = mouse;
  // Same markup on server and client; offsets are written straight to the DOM (none when reduced).
  useEffect(() => {
    const el = ref.current;
    if (!el || !ctx.enabled) return;
    const write = () => {
      const x = ctx.sx.get() * mx;
      const y = ctx.sy.get() * my + ctx.progress.get() * scroll;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    };
    const offs = [ctx.sx.on(write), ctx.sy.on(write), ctx.progress.on(write)];
    write();
    return () => {
      offs.forEach((off) => off());
      el.style.transform = "";
    };
  }, [ctx, mx, my, scroll]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
