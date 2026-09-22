import { useEffect, useRef } from 'react';
import { useScrollProgress } from '../store/scrollProgress';

interface Step {
  range: [number, number];
  eyebrow: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    range: [0, 0.22],
    eyebrow: '01',
    title: 'We understand your hotel',
    body: 'We assess your current operation: systems, team, and the guest journey. No commitment, no friction.',
  },
  {
    range: [0.22, 0.46],
    eyebrow: '02',
    title: 'We connect everything in one place',
    body: 'PMS, payments, guest communication — all integrated into a single source of truth. No more scattered spreadsheets.',
  },
  {
    range: [0.46, 0.74],
    eyebrow: '03',
    title: 'We train and launch',
    body: 'Your team trained, a controlled pilot, zero surprises.',
  },
  {
    range: [0.74, 0.9],
    eyebrow: '04',
    title: "You're live — and improving",
    body: 'Implementation in weeks, not months. Low cost, full visibility, scalable whenever you decide.',
  },
];

// Short fade in/out relative to each step's own range, so consecutive
// panels barely overlap and never fight for the same screen space —
// all panels share one fixed position, so a crossfade is a clean blend.
function opacityFor(progress: number, [start, end]: [number, number]) {
  const span = end - start;
  const fade = Math.min(span * 0.25, 0.04);
  const fadeIn = start + fade;
  const fadeOut = end - fade;
  if (progress < start || progress > end) return 0;
  if (progress < fadeIn) return (progress - start) / (fadeIn - start);
  if (progress > fadeOut) return 1 - (progress - fadeOut) / (end - fadeOut);
  return 1;
}

export default function StepOverlay() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const unsub = useScrollProgress.subscribe((state) => {
      const p = state.progress;
      STEPS.forEach((step, i) => {
        const el = refs.current[i];
        if (!el) return;
        const o = opacityFor(p, step.range);
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - o) * 14}px) scale(${0.97 + o * 0.03})`;
      });
    });
    return unsub;
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex items-end justify-center pb-20 md:items-center md:pb-0">
      {STEPS.map((step, i) => (
        <div
          key={step.title}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="absolute w-full max-w-lg px-6 opacity-0 transition-opacity duration-300 ease-out md:px-0"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-panel/80 px-7 py-6 shadow-[0_20px_60px_-15px_rgba(45,212,191,0.25)] backdrop-blur-md">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-teal via-violet to-teal" />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-3 -top-8 select-none font-display text-[110px] font-bold leading-none text-white/[0.05]"
            >
              {step.eyebrow}
            </span>

            <div className="relative flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs tracking-[0.35em] text-teal">{step.eyebrow}</span>
                <div className="flex gap-1.5">
                  {STEPS.map((_, dotIndex) => (
                    <span
                      key={dotIndex}
                      className={`h-1 w-4 rounded-full ${
                        dotIndex === i ? 'bg-gradient-to-r from-teal to-violet' : 'bg-white/15'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <h2 className="font-display text-2xl font-semibold text-headline md:text-3xl">
                {step.title}
              </h2>
              <p className="text-sm text-white/70 md:text-base">{step.body}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
