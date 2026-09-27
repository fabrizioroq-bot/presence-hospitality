"use client";

import { useInView, useReducedMotion } from "@/lib/hooks";
import { useEffect, useRef, useState } from "react";

/** Counts a range up from 0 (e.g. "40–65%") when half visible (adapted from Magic UI "Number Ticker"). */
export function RangeTicker({ from, to, suffix = "%", className }: { from: number; to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, 0.5);
  const reduce = useReducedMotion();
  const [p, setP] = useState(1);
  // After hydration, park at 0 until the ticker is seen (server HTML keeps the final values).
  useEffect(() => {
    if (reduce) return;
    const id = requestAnimationFrame(() => setP((v) => (v === 1 ? 0 : v)));
    return () => cancelAnimationFrame(id);
  }, [reduce]);
  useEffect(() => {
    if (!seen || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / 1400);
      setP(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduce]);
  // Server + first paint show the final values (no layout shift, correct for crawlers).
  return (
    <span ref={ref} className={className}>
      <span aria-hidden className="tabular-nums">
        {Math.round(from * (reduce ? 1 : p))}–{Math.round(to * (reduce ? 1 : p))}
        {suffix}
      </span>
      {/* Screen readers get only the final range, never the counting digits. */}
      <span className="sr-only">{`${from}–${to}${suffix}`}</span>
    </span>
  );
}
