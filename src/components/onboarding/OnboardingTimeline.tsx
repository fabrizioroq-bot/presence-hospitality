"use client";

import { useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { stepIcons } from "./StepIcons";

export type OnboardingStep = { title: string; body: string; get: string };

// Step i counts as reached slightly before the line gets to it.
const reachedCount = (v: number, n: number) => Math.max(0, Math.min(n, Math.floor(v * n + 0.35)));

// Share of the pinned scroll used to light all six steps; the rest is a short dwell before release.
const LIT_AT = 0.85;

/**
 * Six steps on a dashed line; a solid line fills with scroll and each step lights up as it's
 * reached. Desktop (when the scene fits): the header + timeline pin in the viewport (CSS sticky,
 * ~1.7 screens) and release once every step is lit. Server HTML shows every step fully.
 */
export function OnboardingTimeline({ steps, youGet, header }: { steps: OnboardingStep[]; youGet: string; header: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const n = steps.length;
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (min-height: 860px) and (prefers-reduced-motion: no-preference)");
    const update = () => setPinned(mq.matches);
    const id = requestAnimationFrame(update);
    mq.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener("change", update);
    };
  }, []);
  // Desktop: progress across the whole pin track. Mobile: as the list passes through the viewport.
  const { scrollYProgress: pinProgress } = useScroll({ target: ref, offset: pinned ? ["start start", "end end"] : ["start 0.8", "end 0.6"] });
  const { scrollYProgress: listProgress } = useScroll({ target: mobileRef, offset: ["start 0.8", "end 0.6"] });
  const line = useMotionValue(0);
  const lineMobile = useMotionValue(0);
  const toLine = (v: number) => (pinned ? Math.min(1, v / LIT_AT) : v);
  const [reached, setReached] = useState(n);

  const [reachedMobile, setReachedMobile] = useState(n);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const v = Math.min(1, pinProgress.get() / (pinned ? LIT_AT : 1));
      const m = listProgress.get();
      line.set(reduce ? 1 : v);
      lineMobile.set(reduce ? 1 : m);
      setReached(reduce ? n : reachedCount(v, n));
      setReachedMobile(reduce ? n : reachedCount(m, n));
    });
    return () => cancelAnimationFrame(id);
  }, [reduce, pinProgress, listProgress, line, lineMobile, n, pinned]);
  useMotionValueEvent(pinProgress, "change", (v) => {
    if (reduce) return;
    const l = toLine(v);
    line.set(l);
    const c = reachedCount(l, n);
    setReached((r) => (r === c ? r : c));
  });
  useMotionValueEvent(listProgress, "change", (v) => {
    if (reduce) return;
    lineMobile.set(v);
    const c = reachedCount(v, n);
    setReachedMobile((r) => (r === c ? r : c));
  });

  const card = (s: OnboardingStep, i: number, reached: number, className?: string) => (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-mist-surface/70 p-5 transition-[opacity,transform,border-color] duration-500 ease-out pin:gap-2 pin:p-4",
        i < reached ? "translate-y-0 border-line-mist opacity-100" : "translate-y-3 border-line-mist/40 opacity-40",
        className,
      )}
    >
      <span className={cn("transition-colors duration-500 pin:hidden", i < reached ? "text-ink-900" : "text-ink-500")}>{stepIcons[i]}</span>
      <h3 className="text-heading-sm font-extrabold">{s.title}</h3>
      <p className="text-body-sm text-ink-700">{s.body}</p>
      <p className="mt-auto border-t border-line-mist/40 pt-3 text-body-sm">
        <span className="block text-label text-ink-500">{youGet}</span>
        <span className="mt-1.5 block font-semibold text-ink-900">{s.get}</span>
      </p>
    </div>
  );

  const node = (i: number, reached: number) => (
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
    <div ref={ref} className="relative pin:h-[270svh]">
      <div className="pin:sticky pin:top-0 pin:flex pin:h-svh pin:flex-col pin:justify-center pin:pt-(--nav-h)">
      {header}
      {/* ---------- Desktop: horizontal, cards alternate above/below the line ---------- */}
      <ol className="relative mt-12 hidden grid-cols-6 gap-x-4 lg:mt-16 lg:grid lg:grid-rows-[1fr_auto_1fr] pin:mt-8">
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2" style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--line-mist) 0 6px, transparent 6px 12px)" }} />
        <m.span aria-hidden style={{ scaleX: line }} className="absolute inset-x-0 top-1/2 h-0.5 origin-left -translate-y-1/2 bg-ink-900" />
        {steps.map((s, i) => {
          const above = i % 2 === 0;
          // Pinned: widen each card to 1.5 columns, spilling into the empty neighbour slot.
          const widen = i === 0 ? "pin:w-[150%]" : i === n - 1 ? "pin:-ml-[50%] pin:w-[150%]" : "pin:-ml-[25%] pin:w-[150%]";
          return (
            <li key={s.title} className="contents">
              <div style={{ gridColumn: i + 1, gridRow: 1 }} className="flex items-end pb-6">
                {above && card(s, i, reached, cn("w-full", widen))}
              </div>
              <div style={{ gridColumn: i + 1, gridRow: 2 }} className="flex justify-center">
                {node(i, reached)}
              </div>
              <div style={{ gridColumn: i + 1, gridRow: 3 }} className="flex items-start pt-6">
                {!above && card(s, i, reached, cn("w-full", widen))}
              </div>
            </li>
          );
        })}
      </ol>
      </div>

      {/* ---------- Mobile / tablet: vertical line on the left ---------- */}
      <ol ref={mobileRef} className="relative mt-12 flex flex-col gap-6 lg:hidden">
        <span aria-hidden className="absolute top-6 bottom-6 left-6 w-px" style={{ backgroundImage: "repeating-linear-gradient(180deg, var(--line-mist) 0 6px, transparent 6px 12px)" }} />
        <m.span aria-hidden style={{ scaleY: lineMobile }} className="absolute top-6 bottom-6 left-6 w-0.5 origin-top -translate-x-[0.5px] bg-ink-900" />
        {steps.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[3rem_1fr] items-start gap-4">
            {node(i, reachedMobile)}
            {card(s, i, reachedMobile)}
          </li>
        ))}
      </ol>
    </div>
  );
}
