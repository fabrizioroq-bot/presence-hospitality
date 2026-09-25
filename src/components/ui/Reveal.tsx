"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { inView, reveal, revealSoft } from "@/lib/motion";

export function Reveal({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "p" | "section";
}) {
  const Comp = m[as];
  return (
    <Comp className={className} variants={reveal} initial="hidden" whileInView="show" viewport={inView}>
      {children}
    </Comp>
  );
}

/**
 * `onLoad` animates on mount instead of on view — use it above the fold, together with
 * `soft` items, so the content is painted from the first frame (LCP-safe).
 */
export function RevealGroup({
  children,
  className,
  gap = 0.07,
  onLoad = false,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  onLoad?: boolean;
  delay?: number;
}) {
  const variants = {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: delay } },
  };
  if (onLoad)
    return (
      <m.div className={className} variants={variants} initial="hidden" animate="show">
        {children}
      </m.div>
    );
  return (
    <m.div className={className} variants={variants} initial="hidden" whileInView="show" viewport={inView}>
      {children}
    </m.div>
  );
}

export function RevealItem({
  children,
  className,
  soft = false,
}: {
  children: ReactNode;
  className?: string;
  /** No opacity change: rise + unblur only (LCP-safe). */
  soft?: boolean;
}) {
  return (
    <m.div className={className} variants={soft ? revealSoft : reveal}>
      {children}
    </m.div>
  );
}
