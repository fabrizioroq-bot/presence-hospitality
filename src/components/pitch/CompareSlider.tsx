"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { DURATION } from "@/lib/motion-tokens";
import { getComparison, setComparison, useComparison } from "./comparison-store";
import { usePitch } from "./pitch-store";

const ANIMATE_MS = DURATION.scene * 1.8;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type CompareStrings = { label: string; traditional: string; presence: string; time: string };

/**
 * "Traditional front desk ↔ With Presence". The presenter's builds animate it (build 1: traditional,
 * build 2: with Presence); dragging or the arrow keys move it at any time. The WebGL stage wipes
 * between the empty desk and the Holobox at the same value.
 */
export function CompareSlider({ strings, chapter }: { strings: CompareStrings; chapter: number }) {
  const value = useComparison();
  const pos = usePitch();
  const reduced = useReducedMotion();
  const last = useRef({ chapter: -1, step: -1 });

  useEffect(() => {
    const prev = last.current;
    last.current = { chapter: pos.chapter, step: pos.step };
    if (pos.chapter !== chapter) return;
    const target = pos.step >= 1 ? 1 : 0;
    // Arriving from another chapter: show the right state at once; within the chapter: animate.
    if (prev.chapter !== chapter || reduced) return setComparison(target);
    if (prev.step === pos.step) return;
    const from = getComparison();
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ANIMATE_MS);
      setComparison(from + (target - from) * easeInOut(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pos.chapter, pos.step, chapter, reduced]);

  const percent = Math.round(value * 100);
  return (
    <div className="flex flex-col gap-[calc(var(--slide-u)*0.9)]">
      <div className="flex items-end justify-between gap-4 text-slide-body font-semibold">
        <span className="flex items-center gap-2">
          {strings.traditional}
          <span className="ui-chip text-slide-small">{strings.time}</span>
        </span>
        <span>{strings.presence}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={percent}
        onChange={(e) => setComparison(Number(e.target.value) / 100)}
        aria-label={strings.label}
        aria-valuetext={percent < 50 ? strings.traditional : strings.presence}
        className="pitch-range"
      />
    </div>
  );
}
