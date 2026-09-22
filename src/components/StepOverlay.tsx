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
          className="absolute flex w-full max-w-md flex-col gap-2 rounded-2xl border border-teal/20 bg-panel/80 px-6 py-5 text-center opacity-0 shadow-[0_0_40px_rgba(45,212,191,0.08)] backdrop-blur-md transition-opacity duration-300 ease-out"
        >
          <span className="font-mono text-xs tracking-[0.35em] text-teal">{step.eyebrow}</span>
          <h2 className="font-display text-2xl font-semibold text-headline md:text-3xl">
            {step.title}
          </h2>
          <p className="text-sm text-white/70 md:text-base">{step.body}</p>
        </div>
      ))}
    </div>
  );
}
