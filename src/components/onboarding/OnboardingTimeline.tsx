"use client";

import { useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { stepIcons } from "./StepIcons";

export type OnboardingStep = { title: string; body: string; get: string };

// Step i counts as reached slightly before the line gets to it.
const reachedCount = (v: number, n: number) => Math.max(0, Math.min(n, Math.floor(v * n + 0.35)));

/**
 * Six steps on a dashed line; a solid line fills with scroll and each step lights up as it's
 * reached. Server HTML shows every step fully (SEO, no-JS); reduced motion keeps it that way.
 */
export function OnboardingTimeline({ steps, youGet }: { steps: OnboardingStep[]; youGet: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const n = steps.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const line = useMotionValue(0);
  const [reached, setReached] = useState(n);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const v = scrollYProgress.get();
      line.set(reduce ? 1 : v);
      setReached(reduce ? n : reachedCount(v, n));
    });
    return () => cancelAnimationFrame(id);
  }, [reduce, scrollYProgress, line, n]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    line.set(v);
    const c = reachedCount(v, n);
    setReached((r) => (r === c ? r : c));
  });

  const card = (s: OnboardingStep, i: number, className?: string) => (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-mist-surface/70 p-5 transition-[opacity,transform,border-color] duration-500 ease-out",
        i < reached ? "translate-y-0 border-line-mist opacity-100" : "translate-y-3 border-line-mist/40 opacity-40",
        className,
      )}
    >
      <span className={cn("transition-colors duration-500", i < reached ? "text-ink-900" : "text-ink-500")}>{stepIcons[i]}</span>
      <h3 className="text-heading-sm font-extrabold">{s.title}</h3>
      <p className="text-body-sm text-ink-700">{s.body}</p>
      <p className="mt-auto border-t border-line-mist/40 pt-3 text-body-sm">
        <span className="block text-label text-ink-500">{youGet}</span>
        <span className="mt-1.5 block font-semibold text-ink-900">{s.get}</span>
      </p>
    </div>
  );

  const node = (i: number) => (
    <span
      className={cn(
        "relative z-10 grid h-12 w-12 place-items-center rounded-pill text-label transition-colors duration-500",
        i < reached ? "bg-ink-900 text-paper-50" : "bg-mist-surface text-ink-700 ring-1 ring-line-mist",
      )}
    >
      {String(i + 1).padStart(2, "0")}
    </span>
  );

  return (
    <div ref={ref}>
      {/* ---------- Desktop: horizontal, cards alternate above/below the line ---------- */}
      <ol className="relative hidden grid-cols-6 gap-x-4 lg:grid lg:grid-rows-[1fr_auto_1fr]">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2" style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--line-mist) 0 6px, transparent 6px 12px)" }} />
        <m.span aria-hidden style={{ scaleX: line }} className="absolute inset-x-0 top-1/2 h-0.5 origin-left -translate-y-1/2 bg-ink-900" />
        {steps.map((s, i) => {
          const above = i % 2 === 0;
          return (
            <li key={s.title} className="contents">
              <div style={{ gridColumn: i + 1, gridRow: 1 }} className="flex items-end pb-6">
                {above && card(s, i, "w-full")}
              </div>
              <div style={{ gridColumn: i + 1, gridRow: 2 }} className="flex justify-center">
                {node(i)}
              </div>
              <div style={{ gridColumn: i + 1, gridRow: 3 }} className="flex items-start pt-6">
                {!above && card(s, i, "w-full")}
              </div>
            </li>
          );
        })}
      </ol>

      {/* ---------- Mobile / tablet: vertical line on the left ---------- */}
      <ol className="relative flex flex-col gap-6 lg:hidden">
        <span aria-hidden className="absolute top-6 bottom-6 left-6 w-px" style={{ backgroundImage: "repeating-linear-gradient(180deg, var(--line-mist) 0 6px, transparent 6px 12px)" }} />
        <m.span aria-hidden style={{ scaleY: line }} className="absolute top-6 bottom-6 left-6 w-0.5 origin-top -translate-x-[0.5px] bg-ink-900" />
        {steps.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[3rem_1fr] items-start gap-4">
            {node(i)}
            {card(s, i)}
          </li>
        ))}
      </ol>
    </div>
  );
}
