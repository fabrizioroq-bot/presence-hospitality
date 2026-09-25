"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { inView, reveal, stagger } from "@/lib/motion";

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

export function RevealGroup({
  children,
  className,
  gap = 0.07,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  return (
    <m.div className={className} variants={stagger(gap)} initial="hidden" whileInView="show" viewport={inView}>
      {children}
    </m.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div className={className} variants={reveal}>
      {children}
    </m.div>
  );
}
