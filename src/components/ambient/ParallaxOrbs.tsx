"use client";

import { useEffect, useRef } from "react";
import { MistOrbs, type Orb } from "@/components/brand/MistOrbs";
import { interp, trackScroll } from "@/lib/anim";
import { cx as cn } from "@/lib/cx";

/** MistOrbs that drift with scroll (±range px) on top of their CSS drift. */
export function ParallaxOrbs({ orbs, range = 70, className }: { orbs: Orb[]; range?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const l = layer.current;
    if (!el || !l || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return trackScroll(el, ["start end", "end start"], (v) => {
      l.style.transform = `translate3d(0, ${interp(v, [0, 1], [range, -range]).toFixed(1)}px, 0)`;
    });
  }, [range]);
  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div ref={layer} className="absolute -inset-y-[80px] inset-x-0 will-change-transform">
        <MistOrbs orbs={orbs} />
      </div>
    </div>
  );
}
