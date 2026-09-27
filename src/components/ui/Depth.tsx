"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { spring, trackScroll } from "@/lib/anim";

/**
 * Layered parallax: shifts its children by ±`range` px as it crosses the viewport (spring-smoothed).
 * Positive range = moves slower than the page (feels further away), negative = nearer.
 * Starts at 0 on server and client (no hydration mismatch); offsets apply from the first scroll.
 */
export function Depth({
  children,
  className,
  range = 40,
  lgOnly = false,
}: {
  children: ReactNode;
  className?: string;
  range?: number;
  /** Only shift from 1024px up, for blocks that sit side by side on desktop but stack (and could collide) below. */
  lgOnly?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lg = window.matchMedia("(min-width: 1024px)");
    const sp = spring((y) => (el.style.transform = y ? `translate3d(0, ${y.toFixed(2)}px, 0)` : ""), { stiffness: 120, damping: 30, mass: 0.4 });
    const off = trackScroll(el, ["start end", "end start"], (v) => sp.set(lgOnly && !lg.matches ? 0 : range - 2 * range * v));
    return () => {
      off();
      sp.stop();
    };
  }, [range, lgOnly]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
