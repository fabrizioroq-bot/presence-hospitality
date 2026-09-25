"use client";

import { useMotionValue } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { DecryptedText } from "@/components/ui/DecryptedText";
import { cn } from "@/lib/cn";
import { detectTier, hasWebGL2, type Tier } from "@/lib/perf-tier";
import type { PointerState } from "./hero-scene";
import { HologramPoster } from "./HologramPoster";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

const MAX_YAW = (35 * Math.PI) / 180;

/**
 * The Holobox stage (experience section): the agent re-forms from the beam each time the stage
 * comes into view; drag horizontally to look around (±35°), it eases back to centre on release.
 */
export function HoloStage({
  hud,
  alt,
  dragHint,
  className,
}: {
  hud: { online: string; route: string; live: string };
  alt: string;
  dragHint: string;
  className?: string;
}) {
  const fig = useRef<HTMLElement | null>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, has: false, fine: false });
  const yaw = useRef(0);
  const noScroll = useMotionValue(0);
  const [tier, setTier] = useState<Tier | null>(null);
  const [load, setLoad] = useState(false);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [reformKey, setReformKey] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Load when near; re-form each time the stage is entered from off-screen.
  useEffect(() => {
    const el = fig.current;
    if (!el || !hasWebGL2()) return;
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setTier(detectTier());
        setLoad(true);
        near.disconnect();
      },
      { rootMargin: "60% 0px" },
    );
    let wasHidden = true;
    const vis = new IntersectionObserver(
      ([e]) => {
        const on = e.isIntersecting && !document.hidden;
        setActive(on);
        if (e.intersectionRatio > 0.35 && wasHidden) {
          wasHidden = false;
          setReformKey((k) => k + 1);
        }
        if (!e.isIntersecting) wasHidden = true;
      },
      { threshold: [0, 0.35] },
    );
    near.observe(el);
    vis.observe(el);
    return () => {
      near.disconnect();
      vis.disconnect();
    };
  }, []);

  // Pointer for attention + turning.
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY, has: true, fine: fine && e.pointerType === "mouse" };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Drag to rotate (horizontal drags only, so vertical page scroll keeps working on touch).
  useEffect(() => {
    const el = fig.current;
    if (!el) return;
    let startX = 0;
    let startY = 0;
    let startYaw = 0;
    let mode: "idle" | "pending" | "drag" = "idle";
    let raf = 0;
    const settle = () => {
      yaw.current *= 0.9;
      raf = Math.abs(yaw.current) > 0.002 ? requestAnimationFrame(settle) : 0;
      if (!raf) yaw.current = 0;
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      cancelAnimationFrame(raf);
      startX = e.clientX;
      startY = e.clientY;
      startYaw = yaw.current;
      mode = "pending";
    };
    const move = (e: PointerEvent) => {
      if (mode === "idle") return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (mode === "pending") {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          mode = "idle";
          return;
        }
        mode = "drag";
        setDragging(true);
        el.setPointerCapture(e.pointerId);
      }
      yaw.current = Math.max(-MAX_YAW, Math.min(MAX_YAW, startYaw + dx * 0.006));
    };
    const up = () => {
      if (mode === "drag") {
        setDragging(false);
        setTimeout(() => {
          raf = requestAnimationFrame(settle);
        }, 1200);
      }
      mode = "idle";
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <figure
      ref={fig}
      data-portal
      data-webgl={ready ? "ready" : undefined}
      className={cn(
        "relative isolate touch-pan-y overflow-hidden rounded-xl shadow-soft ring-1 ring-white/5 select-none",
        dragging ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
    >
      {/* DOM fill + poster until WebGL paints (same panel look) */}
      <div aria-hidden className="portal-fill absolute inset-0 -z-10 bg-night-900" />
      <div
        aria-hidden
        className="portal-fill absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 50% at 66% 100%, rgba(47,127,208,0.3) 0%, rgba(47,127,208,0) 70%), radial-gradient(70% 60% at 60% 40%, rgba(140,196,255,0.07) 0%, rgba(18,20,23,0) 70%)",
        }}
      />
      <div aria-hidden className="portal-fill absolute top-[6%] right-[6%] bottom-0 left-1/2 lg:left-[46%]">
        <HologramPoster />
      </div>

      {load && tier && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <HeroCanvas
            tier={tier}
            portal={fig}
            pointer={pointer}
            scroll={noScroll}
            active={active}
            onReady={() => setReady(true)}
            variant="stage"
            yaw={yaw}
            reformKey={reformKey}
          />
        </div>
      )}

      {/* Scrim for the copy that overlaps the stage (desktop) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{ background: "linear-gradient(90deg, rgba(18,20,23,0.92) 0%, rgba(18,20,23,0.6) 32%, rgba(18,20,23,0) 55%)" }}
      />

      <div className="pointer-events-none absolute inset-x-5 top-5 flex items-center justify-between gap-3 text-label text-paper-300 lg:inset-x-8 lg:top-8">
        <span className="inline-flex items-center gap-2">
          <span className="live-dot" aria-hidden />
          <DecryptedText text={hud.online} delay={200} />
        </span>
        <DecryptedText text={hud.route} delay={500} className="hidden sm:inline" />
      </div>
      <div className="pointer-events-none absolute right-5 bottom-5 flex flex-col items-end gap-2 text-label text-paper-300 lg:right-8 lg:bottom-8">
        <span className="hidden items-center gap-2 text-paper-500 [@media(pointer:fine)]:inline-flex">
          <span aria-hidden>↔</span> {dragHint}
        </span>
        <DecryptedText text={hud.live} delay={800} />
      </div>
      <figcaption className="sr-only">{alt}</figcaption>
      <BorderBeam duration={10} />
    </figure>
  );
}
