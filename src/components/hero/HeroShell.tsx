"use client";

import {
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import * as m from "motion/react-m";
import dynamic from "next/dynamic";
import { createContext, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import type { PointerState } from "@/components/hologram/hero-scene";
import { detectTier, hasWebGL2, type Tier } from "@/lib/perf-tier";

const HeroCanvas = dynamic(() => import("@/components/hologram/HeroCanvas"), { ssr: false });

type Ctx = { sx: MotionValue<number>; sy: MotionValue<number>; progress: MotionValue<number>; enabled: boolean };
const ParallaxCtx = createContext<Ctx | null>(null);

/**
 * Client shell for the hero: owns pointer + scroll state, depth parallax, and the
 * lazily loaded WebGL scene (fog field + hologram). The poster covers the gap.
 */
export function HeroShell({ children, ...props }: ComponentProps<"section"> & { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLElement | null>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, has: false, fine: false });
  const reduce = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18 });
  const sy = useSpring(my, { stiffness: 40, damping: 18 });

  const [tier, setTier] = useState<Tier | null>(null);
  const [load, setLoad] = useState(false);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);

  // Pointer tracking (no React renders).
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY, has: true, fine: fine && e.pointerType === "mouse" };
      if (fine && !reduce) {
        mx.set((e.clientX / window.innerWidth) * 2 - 1);
        my.set((e.clientY / window.innerHeight) * 2 - 1);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  // Decide whether/when to load WebGL: first interaction, or idle after load.
  useEffect(() => {
    if (!hasWebGL2()) return;
    portalRef.current = ref.current?.querySelector<HTMLElement>("[data-portal]") ?? null;

    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      setTier(detectTier());
      setLoad(true);
      cleanup();
    };
    // Load on the first real interaction; otherwise after a long quiet delay. This keeps
    // three.js parsing and shader compilation out of the initial load (TBT / LCP).
    const events = ["pointermove", "pointerdown", "wheel", "scroll", "touchstart", "keydown"] as const;
    events.forEach((ev) => window.addEventListener(ev, go, { once: true, passive: true }));
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      timer = setTimeout(go, 7000);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    function cleanup() {
      events.forEach((ev) => window.removeEventListener(ev, go));
      window.removeEventListener("load", schedule);
      clearTimeout(timer);
    }
    return cleanup;
  }, []);

  // Pause rendering off-screen and in hidden tabs.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visible = true;
    const update = () => setActive(visible && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <ParallaxCtx.Provider value={{ sx, sy, progress: scrollYProgress, enabled: !reduce }}>
      <section ref={ref} data-webgl={ready ? "ready" : undefined} {...props}>
        {load && tier && (
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5]">
            <HeroCanvas
              tier={tier}
              portal={portalRef}
              pointer={pointer}
              scroll={scrollYProgress}
              active={active}
              onReady={() => setReady(true)}
            />
          </div>
        )}
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
  const k = ctx.enabled ? 1 : 0; // same markup on server and client; zero offsets when reduced
  const x = useTransform(ctx.sx, (v) => v * mouse[0] * k);
  const y = useTransform([ctx.sy, ctx.progress], ([a, b]: number[]) => (a * mouse[1] + b * scroll) * k);
  return (
    <m.div style={{ x, y }} className={className}>
      {children}
    </m.div>
  );
}
