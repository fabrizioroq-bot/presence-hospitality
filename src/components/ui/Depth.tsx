"use client";

import { useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import * as m from "motion/react-m";
import { useRef, type ReactNode } from "react";

/**
 * Layered parallax: shifts its children by ±`range` px as it crosses the viewport.
 * Positive range = moves slower than the page (feels further away), negative = nearer.
 * Starts at 0 on server and client (no hydration mismatch); offsets apply from the first scroll event.
 */
export function Depth({ children, className, range = 40 }: { children: ReactNode; className?: string; range?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const target = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    target.set(reduce ? 0 : range - 2 * range * v);
  });
  const y = useSpring(target, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <m.div ref={ref} style={{ y }} className={className}>
      {children}
    </m.div>
  );
}
