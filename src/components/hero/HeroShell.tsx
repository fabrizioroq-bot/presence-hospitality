"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import type { PointerState } from "@/components/hologram/hero-scene";
import { spring, trackScroll, Value } from "@/lib/anim";
import { useNear, useReducedMotion } from "@/lib/hooks";
import { detectTier, hasWebGL2, type Tier } from "@/lib/perf-tier";

const HeroCanvas = dynamic(() => import("@/components/hologram/HeroCanvas"), { ssr: false });

type Ctx = { sx: Value; sy: Value; progress: Value; enabled: boolean };
const ParallaxCtx = createContext<Ctx | null>(null);

/**
 * Client shell for the hero: owns pointer + scroll state, depth parallax, and the
 * lazily loaded WebGL scene (fog field + hologram). The poster covers the gap.
 */
export function HeroShell({ children, ...props }: ComponentProps<"section"> & { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLElement | null>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, has: false, fine: false });
  const reduce = useReducedMotion();

  // Scroll progress through the hero + spring-smoothed pointer (-1..1), shared with <Parallax>.
  const [vals] = useState(() => ({ progress: new Value(0), sx: new Value(0), sy: new Value(0) }));
  const { progress, sx, sy } = vals;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return trackScroll(el, ["start start", "end start"], (v) => progress.set(v));
  }, [progress]);

  const [tier, setTier] = useState<Tier | null>(null);
  const [load, setLoad] = useState(false);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  // Unmount the scene when the hero is far off-screen; the poster returns until it repaints.
  const onFar = useCallback(() => setReady(false), []);
  const near = useNear(ref, "150% 0px", onFar);

  // Pointer tracking (no React renders).
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const spX = spring((v) => sx.set(v), { stiffness: 40, damping: 18, mass: 1 });
    const spY = spring((v) => sy.set(v), { stiffness: 40, damping: 18, mass: 1 });
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY, has: true, fine: fine && e.pointerType === "mouse" };
      if (fine && !reduce) {
        spX.set((e.clientX / window.innerWidth) * 2 - 1);
        spY.set((e.clientY / window.innerHeight) * 2 - 1);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      spX.stop();
      spY.stop();
    };
  }, [sx, sy, reduce]);

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
    <ParallaxCtx.Provider value={{ sx, sy, progress, enabled: !reduce }}>
      <section ref={ref} data-webgl={ready ? "ready" : undefined} {...props}>
        {load && tier && near && (
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5]">
            <HeroCanvas
              tier={tier}
              portal={portalRef}
              pointer={pointer}
              scroll={progress}
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
