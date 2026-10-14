"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { DURATION } from "@/lib/motion-tokens";
import { usePitch } from "./pitch-store";

const COUNT_MS = DURATION.slow * 2;

/**
 * Counts from 0 to `to` when the presenter reaches `chapter`/`step`. Server HTML holds the final
 * value (crawlers, screen readers, reduced motion); the count writes straight to the DOM.
 */
export function StepCount({ to, chapter, step }: { to: number; chapter: number; step: number }) {
  const el = useRef<HTMLSpanElement>(null);
  const pos = usePitch();
  const reduced = useReducedMotion();
  const isReached = pos.chapter > chapter || (pos.chapter === chapter && pos.step >= step);
  const isBefore = pos.chapter < chapter || (pos.chapter === chapter && pos.step < step);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    if (reduced || pos.chapter > chapter) {
      node.textContent = String(to);
      return;
    }
    if (isBefore) {
      node.textContent = "0";
      return;
    }
    if (!isReached) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / COUNT_MS);
      node.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isReached, isBefore, reduced, pos.chapter, chapter, to]);

  return (
    <span ref={el} className="tabular-nums">
      {to}
    </span>
  );
}
