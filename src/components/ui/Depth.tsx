"use client";

import { useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import * as m from "motion/react-m";
import { useRef, type ReactNode } from "react";

/**
 * Layered parallax: shifts its children by ±`range` px as it crosses the viewport.
 * Positive range = moves slower than the page (feels further away), negative = nearer.
 * Starts at 0 on server and client (no hydration mismatch); offsets apply from the first scroll event.
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
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const target = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const off = reduce || (lgOnly && !window.matchMedia("(min-width: 1024px)").matches);
    target.set(off ? 0 : range - 2 * range * v);
  });
  const y = useSpring(target, { stiffness: 120, damping: 30, mass: 0.4 });
  return (
    <m.div ref={ref} style={{ y }} className={className}>
      {children}
    </m.div>
  );
}
