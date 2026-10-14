"use client";

import { useEffect, useRef } from "react";
import { DEMAND_SHAPE, smoothPath } from "@/lib/chart";
import { useReducedMotion } from "@/lib/hooks";
import { usePitch } from "./pitch-store";

// Plot geometry (SVG user units ≈ CSS px at 1080p).
const W = 960;
const H = 560;
const PLOT = { x: 70, y: 70, w: 860, h: 400 };
const STAFFED = 0.86;
const SWEEP_MS = 4600;
const NIGHTS: [number, number][] = [
  [0, 7],
  [21, 24],
];
const LABEL_AT = 7.5 / 24; // the label appears once the first night has been swept

const x = (hour: number) => PLOT.x + (hour / 24) * PLOT.w;
const y = (value: number) => PLOT.y + PLOT.h - value * PLOT.h;
const demandPts = DEMAND_SHAPE.map((v, h) => [x(h), y(v)] as [number, number]);
const staffedY = y(STAFFED);

/** Area between the staffed line and the demand curve for hours [a, b]. */
function gap([a, b]: [number, number]) {
  const top = `M${x(a)} ${staffedY} L${x(b)} ${staffedY}`;
  const bottom = demandPts.slice(a, b + 1).reverse().map(([px, py]) => `L${px} ${py}`).join(" ");
  return `${top} ${bottom} Z`;
}

export type DemandSweepStrings = { title: string; staffed: string; demand: string; idle: string; illustrative: string; time: string; desc: string };

/**
 * "24 hours at the front desk" (The problem): a clock sweeps 00:00 → 24:00, the demand curve draws
 * behind a scrubber and the night gaps fill as "paid idle time". Runs when the presenter reaches
 * `chapter`/`step`; final state for reduced motion or when coming back.
 */
export function DemandSweep({ strings, chapter, step }: { strings: DemandSweepStrings; chapter: number; step: number }) {
  const pos = usePitch();
  const reduced = useReducedMotion();
  const reveal = useRef<SVGRectElement>(null);
  const scrubber = useRef<SVGGElement>(null);
  const hand = useRef<SVGLineElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const label = useRef<SVGGElement>(null);
  const isBefore = pos.chapter < chapter || (pos.chapter === chapter && pos.step < step);
  const isPast = pos.chapter > chapter;

  useEffect(() => {
    const paint = (p: number) => {
      reveal.current?.setAttribute("width", String(PLOT.w * p + 2));
      scrubber.current?.setAttribute("transform", `translate(${PLOT.w * p} 0)`);
      scrubber.current?.setAttribute("opacity", p > 0 && p < 1 ? "1" : "0");
      hand.current?.setAttribute("transform", `rotate(${p * 720} 20 20)`);
      if (time.current) time.current.textContent = `${String(Math.min(24, Math.floor(p * 24))).padStart(2, "0")}:00`;
      label.current?.setAttribute("opacity", p >= LABEL_AT ? "1" : "0");
    };
    if (isBefore) return paint(0);
    if (isPast || reduced) return paint(1);
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / SWEEP_MS);
      paint(t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2); // ease in-out
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isBefore, isPast, reduced]);

  return (
    <figure className="flex flex-col gap-[calc(var(--slide-u)*1.2)]">
      <figcaption className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-3">
          <svg aria-hidden viewBox="0 0 40 40" className="h-[max(2rem,calc(var(--slide-u)*2.6))] w-auto">
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
            <line ref={hand} x1="20" y1="20" x2="20" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="text-slide-h3">{strings.title}</span>
        </span>
        <span className="flex items-center gap-3">
          <span ref={time} aria-label={strings.time} className="text-slide-h3 tabular-nums">
            24:00
          </span>
          <span className="ui-chip text-slide-small">{strings.illustrative}</span>
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="pitch-chart-title pitch-chart-desc" className="w-full overflow-visible">
        <title id="pitch-chart-title">{strings.title}</title>
        <desc id="pitch-chart-desc">{strings.desc}</desc>
        <defs>
          <clipPath id="pitch-chart-reveal">
            <rect ref={reveal} x={PLOT.x - 1} y={0} width={PLOT.w + 2} height={H} />
          </clipPath>
        </defs>
        {[0, 6, 12, 18, 24].map((h) => (
          <g key={h}>
            <line x1={x(h)} x2={x(h)} y1={PLOT.y} y2={PLOT.y + PLOT.h} stroke="var(--ui-rule)" strokeOpacity={0.25} />
            <text x={x(h)} y={PLOT.y + PLOT.h + 40} textAnchor="middle" fill="var(--ui-ink-2)" fontSize="22">
              {`${String(h).padStart(2, "0")}:00`}
            </text>
          </g>
        ))}
        <line x1={PLOT.x} x2={PLOT.x + PLOT.w} y1={PLOT.y + PLOT.h} y2={PLOT.y + PLOT.h} stroke="var(--ui-rule)" />
        <g clipPath="url(#pitch-chart-reveal)">
          <path d={gap([0, 24])} fill="var(--ui-ink)" fillOpacity={0.06} />
          {NIGHTS.map((n) => (
            <path key={n[0]} d={gap(n)} fill="var(--amber-400)" fillOpacity={0.6} />
          ))}
          <path d={smoothPath(demandPts)} fill="none" stroke="var(--pitch-pill-from)" strokeWidth={5} strokeLinecap="round" />
        </g>
        <line x1={PLOT.x} x2={PLOT.x + PLOT.w} y1={staffedY} y2={staffedY} stroke="var(--ui-ink)" strokeWidth={3} strokeDasharray="14 10" />
        <g ref={scrubber} opacity={0}>
          <line x1={PLOT.x} x2={PLOT.x} y1={PLOT.y - 10} y2={PLOT.y + PLOT.h} stroke="var(--ui-ink)" strokeWidth={2} />
        </g>
        <g ref={label} opacity={1} style={{ transition: "opacity var(--dur-slow) var(--ease-out)" }}>
          <rect x={x(3.5) - 112} y={y(0.5) - 26} width={224} height={52} rx={26} fill="var(--amber-400)" />
          <text x={x(3.5)} y={y(0.5) + 8} textAnchor="middle" fill="var(--pitch-ink)" fontSize="24" fontWeight="700">
            {strings.idle}
          </text>
        </g>
        <g fontSize="22" fill="var(--ui-ink)">
          <line x1={PLOT.x} x2={PLOT.x + 44} y1={20} y2={20} stroke="var(--ui-ink)" strokeWidth={3} strokeDasharray="14 10" />
          <text x={PLOT.x + 56} y={28}>
            {strings.staffed}
          </text>
          <line x1={PLOT.x + 260} x2={PLOT.x + 304} y1={20} y2={20} stroke="var(--pitch-pill-from)" strokeWidth={5} strokeLinecap="round" />
          <text x={PLOT.x + 316} y={28}>
            {strings.demand}
          </text>
        </g>
      </svg>
    </figure>
  );
}
