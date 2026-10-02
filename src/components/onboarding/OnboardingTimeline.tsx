"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { trackScroll } from "@/lib/anim";
import { useReducedMotion } from "@/lib/hooks";
import { cx as cn } from "@/lib/cx";
import { SwipeDots } from "@/components/ui/SwipeDots";
import { stepIcons } from "./StepIcons";

export type OnboardingStep = { title: string; body: string; get: string };

// Step i counts as reached slightly before the line gets to it.
const reachedCount = (v: number, n: number) =>
  Math.max(0, Math.min(n, Math.floor(v * n + 0.35)));

// Share of the pinned scroll used to light all six steps; the rest holds the completed state.
const LIT_AT = 0.75;
const PIN_QUERY =
  "(min-width: 1024px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)";

/**
 * Six steps on a dashed line; a solid line fills with scroll and each step lights up as it's
 * reached. Desktop (≥650px tall): the header + timeline pin in the viewport (CSS sticky,
 * ~2.75 screens), scaled down to fit short viewports; all steps are lit at 75% and the completed
 * state holds until release. Server HTML shows every step fully.
 */
export function OnboardingTimeline({
  steps,
  youGet,
  header,
  swipeLabel,
  stepHeading: StepHeading = "h3",
}: {
  stepHeading?: "h2" | "h3";
  steps: OnboardingStep[];
  youGet: string;
  header: ReactNode;
  swipeLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const n = steps.length;
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    const update = () => setPinned(mq.matches);
    const id = requestAnimationFrame(update);
    mq.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener("change", update);
    };
  }, []);
  const lineRef = useRef<HTMLSpanElement>(null);

  // Scale the pinned scene down (never up) so header + timeline always fit the viewport.
  const fitRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = fitRef.current;
    if (!el || !pinned) return;
    const measure = () => {
      const nav =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-h",
          ),
        ) || 72;
      const avail = window.innerHeight - nav - 40;
      const k = Math.min(1, avail / Math.max(1, el.offsetHeight));
      setScale((prev) => (Math.abs(prev - k) < 0.005 ? prev : k));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);
  const [reached, setReached] = useState(n);

  // Desktop: progress across the whole pin track. Mobile: as the list passes through the viewport.
  // The line is written straight to the DOM; only the lit-step count re-renders.
  useEffect(() => {
    const el = ref.current;
    const ln = lineRef.current;
    if (!el || !ln) return;
    if (reduce) {
      ln.style.transform = "scaleX(1)";
      const id = requestAnimationFrame(() => setReached(n));
      return () => cancelAnimationFrame(id);
    }
    return trackScroll(el, pinned ? ["start start", "end end"] : ["start 0.8", "end 0.6"], (v) => {
      const l = pinned ? Math.min(1, v / LIT_AT) : v;
      ln.style.transform = `scaleX(${l})`;
      const c = reachedCount(l, n);
      setReached((r) => (r === c ? r : c));
    });
  }, [reduce, n, pinned]);

  const card = (
    s: OnboardingStep,
    i: number,
    reached: number,
    className?: string,
  ) => (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-mist-surface/70 p-5 transition-[opacity,transform,border-color] duration-500 ease-out pin:gap-2 pin:p-4",
        i < reached
          ? "translate-y-0 border-line-mist opacity-100"
          : "translate-y-3 border-line-mist/40 opacity-40",
        className,
      )}
    >
      <span
        className={cn(
          "transition-colors duration-500 pin:hidden",
          i < reached ? "text-ink-900" : "text-ink-500",
        )}
      >
        {stepIcons[i]}
      </span>
      <StepHeading className="text-heading-sm font-extrabold">{s.title}</StepHeading>
      <p className="text-body-sm text-ink-700">{s.body}</p>
      <p className="mt-auto border-t border-line-mist/40 pt-3 text-body-sm">
        <span className="block text-label text-ink-500">{youGet}</span>
        <span className="mt-1.5 block font-semibold text-ink-900">{s.get}</span>
      </p>
    </div>
  );

  const node = (i: number, reached: number) => (
    <span
      data-lit={i < reached ? "" : undefined}
      className={cn(
        "step-node relative z-10 grid h-12 w-12 place-items-center rounded-pill text-label transition-[color,background-color,box-shadow] duration-500",
        i < reached
          ? "bg-petrol text-paper-50"
          : "bg-mist-surface text-ink-700 ring-1 ring-line-mist",
      )}
    >
      {String(i + 1).padStart(2, "0")}
    </span>
  );

  return (
    <div ref={ref} className="relative pin:h-[375svh]">
      <div className="pin:sticky pin:top-0 pin:flex pin:h-svh pin:items-center pin:justify-center pin:overflow-hidden pin:pt-(--nav-h)">
        <div
          ref={fitRef}
          className="w-full origin-center"
          style={
            pinned && scale < 1 ? { transform: `scale(${scale})` } : undefined
          }
        >
          {header}
          {/* ---------- Desktop: horizontal, cards alternate above/below the line ---------- */}
          <ol className="relative mt-12 hidden grid-cols-6 gap-x-4 lg:mt-16 lg:grid lg:grid-rows-[1fr_auto_1fr] pin:mt-8">
            <span
              aria-hidden
              className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, var(--line-mist) 0 6px, transparent 6px 12px)",
              }}
            />
            <span
              ref={lineRef}
              aria-hidden
              style={{ transform: "scaleX(0)" }}
              className="accent-line absolute inset-x-0 top-1/2 h-0.5 origin-left -translate-y-1/2 bg-petrol"
            />
            {steps.map((s, i) => {
              const above = i % 2 === 0;
              // Pinned: cards alternate above/below the line, so each can spill into the empty
              // neighbour slots: edge cards to 1.5 columns, middle cards to 1.85 (never touching).
              const widen =
                i === 0
                  ? "pin:w-[150%]"
                  : i === n - 1
                    ? "pin:-ml-[50%] pin:w-[150%]"
                    : "pin:-ml-[42.5%] pin:w-[185%]";
              return (
                <li key={s.title} className="contents">
                  <div
                    style={{ gridColumn: i + 1, gridRow: 1 }}
                    className="flex items-end pb-6"
                  >
                    {above && card(s, i, reached, cn("w-full", widen))}
                  </div>
                  <div
                    style={{ gridColumn: i + 1, gridRow: 2 }}
                    className="flex justify-center"
                  >
                    {node(i, reached)}
                  </div>
                  <div
                    style={{ gridColumn: i + 1, gridRow: 3 }}
                    className="flex items-start pt-6"
                  >
                    {!above && card(s, i, reached, cn("w-full", widen))}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* ---------- Mobile / tablet: a swipe row of steps ---------- */}
      <ol id="onboarding-steps" tabIndex={0} aria-label={swipeLabel} className="swipe-row mt-8 lg:hidden">
        {steps.map((s, i) => (
          <li key={s.title} className="swipe-item flex flex-col gap-3">
            {node(i, n)}
            {card(s, i, n, "flex-1")}
          </li>
        ))}
      </ol>
      <SwipeDots target="onboarding-steps" count={n} label={swipeLabel} />
    </div>
  );
}
