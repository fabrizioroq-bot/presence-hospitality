"use client";

import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";

// Adapted from Magic UI "Border Beam": uses `m` (LazyMotion strict), token colours, and
// stays hidden for reduced-motion users.
export function BorderBeam({
  size = 120,
  duration = 8,
  delay = 0,
  colorFrom = "var(--holo-300)",
  colorTo = "var(--amber-400)",
  borderWidth = 1.5,
}: {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--beam-w) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box]"
      style={{ "--beam-w": `${borderWidth}px` } as CSSProperties}
    >
      <m.div
        className="absolute aspect-square bg-linear-to-l from-(--beam-from) via-(--beam-to) to-transparent"
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--beam-from": colorFrom,
            "--beam-to": colorTo,
          } as CSSProperties
        }
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay }}
      />
    </div>
  );
}
