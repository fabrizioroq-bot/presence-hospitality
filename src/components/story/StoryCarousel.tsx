"use client";

import { useReducedMotion } from "@/lib/hooks";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { cx as cn } from "@/lib/cx";
import { HumanCard, humanState, SpeechBubbles, type HumanLabels } from "./human";
import { LobbySketch, type SketchLabels } from "./LobbySketch";

// Scene position (s) shown for each step. Moving between steps tweens s, so the traveller
// actually walks and the agent forms, using the same timeline as the desktop WebGL story.
export const STILL = [0.42, 1.9, 2.6, 3.8, 4.95, 5.45];

export type CarouselLabels = {
  region: string;
  step: string;
  prev: string;
  next: string;
  goTo: string; // "Go to step {n}"
  steps: { title: string; body: string }[];
  sketch: SketchLabels;
  human: HumanLabels;
};

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const AUTOPLAY_MS = 3000; // time on each step
const RESUME_MS = 6000; // idle time after a user interaction before autoplay resumes

/**
 * Mobile (and reduced-motion) guest journey: one animated lobby scene + a swipeable step carousel.
 * Autoplays every 3 s while in view (never with reduced motion); any touch, swipe, key or focus
 * pauses it, and it resumes after 6 s idle.
 */
export function StoryCarousel({ labels }: { labels: CarouselLabels }) {
  const n = labels.steps.length;
  const [i, setI] = useState(0);
  const [s, setS] = useState(STILL[0]);
  const sRef = useRef(STILL[0]);
  const jumpRef = useRef(false); // next step change jumps instead of tweening (loop back to 1)
  const region = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);
  const autoplay = !reduce && inView && !paused;

  // Tween the scene towards the active step.
  useEffect(() => {
    const from = sRef.current;
    const to = STILL[i];
    let raf = 0;
    if (reduce || jumpRef.current) {
      jumpRef.current = false;
      raf = requestAnimationFrame(() => {
        sRef.current = to;
        setS(to);
      });
      return () => cancelAnimationFrame(raf);
    }
    const dur = 700 + Math.min(1.5, Math.abs(to - from)) * 450;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const v = from + (to - from) * easeInOut(k);
      sRef.current = v;
      setS(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i, reduce]);

  // Swipe: the active slide follows the horizontal scroll position.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const idx = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
        setI((p) => (p === idx ? p : Math.max(0, Math.min(n - 1, idx))));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [n]);

  const go = useCallback(
    (idx: number, instant = false) => {
      const el = track.current;
      const target = Math.max(0, Math.min(n - 1, idx));
      if (!el) return;
      el.scrollTo({
        left: target * el.clientWidth,
        behavior: reduce || instant ? "auto" : "smooth",
      });
      setI(target);
    },
    [n, reduce],
  );

  // Autoplay only while at least half the carousel is on screen and the tab is visible.
  useEffect(() => {
    const el = region.current;
    if (!el) return;
    let visible = false;
    const update = () => setInView(visible && !document.hidden);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        update();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // Advance every AUTOPLAY_MS; after the last step, fade and jump back to the first.
  useEffect(() => {
    if (!autoplay) return;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    const t = setTimeout(() => {
      if (i < n - 1) {
        go(i + 1);
      } else {
        setFading(true);
        fadeTimer = setTimeout(() => {
          jumpRef.current = true;
          go(0, true);
          setFading(false);
        }, 250);
      }
    }, AUTOPLAY_MS);
    return () => {
      clearTimeout(t);
      clearTimeout(fadeTimer);
    };
  }, [autoplay, i, n, go]);

  // Any user interaction pauses autoplay; it resumes after RESUME_MS without interaction.
  useEffect(() => {
    const el = region.current;
    if (!el || reduce) return;
    let resume: ReturnType<typeof setTimeout> | undefined;
    const pause = () => {
      setPaused(true);
      clearTimeout(resume);
      resume = setTimeout(() => setPaused(false), RESUME_MS);
    };
    const evs = [
      "pointerdown",
      "touchstart",
      "wheel",
      "keydown",
      "focusin",
    ] as const;
    evs.forEach((ev) => el.addEventListener(ev, pause, { passive: true }));
    return () => {
      clearTimeout(resume);
      evs.forEach((ev) => el.removeEventListener(ev, pause));
    };
  }, [reduce]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(i + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(i - 1);
    }
  };

  return (
    <div
      ref={region}
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.region}
      data-autoplay={autoplay ? "on" : paused ? "paused" : inView ? "idle" : "off-screen"}
      onKeyDown={onKey}
      className="flex flex-col gap-5"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-night-900 ring-1 ring-white/5 transition-opacity duration-200",
          fading && "opacity-40",
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 55% 100%, rgba(47,127,208,0.18) 0%, rgba(18,20,23,0) 70%)",
          }}
        />
        <LobbySketch s={s} labels={labels.sketch} className="relative" />
        <div className="@container absolute inset-0">
          <SpeechBubbles state={humanState(s)} labels={labels.human} />
        </div>
        <span className="step-num-dark absolute top-3 left-4 text-label text-paper-300">
          {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
      </div>

      {/* Focusable so keyboard users can scroll it; ←/→ also move between steps (handled on the region). */}
      <div
        ref={track}
        tabIndex={0}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-md focus-visible:outline-offset-[-2px]"
        aria-live={autoplay ? "off" : "polite"}
      >
        {labels.steps.map((st, idx) => (
          <div
            key={st.title}
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} / ${n}`}
            aria-hidden={idx !== i}
            className="flex w-full shrink-0 snap-center flex-col gap-2 px-4"
          >
            <span className="step-num text-label text-ink-500">
              {labels.step} {String(idx + 1).padStart(2, "0")}
            </span>
            <h3 className="text-heading-md">{st.title}</h3>
            <p className="text-body text-ink-700">{st.body}</p>
            {idx === 4 && <HumanCard labels={labels.human} variant="inline" />}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => go(i - 1)}
          disabled={i === 0}
          aria-label={labels.prev}
          className="grid h-11 w-11 place-items-center rounded-pill ring-1 ring-line-mist transition-opacity disabled:opacity-35"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 8H3M7 4 3 8l4 4" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          {labels.steps.map((st, idx) => (
            <button
              key={st.title}
              type="button"
              onClick={() => go(idx)}
              aria-label={labels.goTo.replace("{n}", String(idx + 1))}
              aria-current={idx === i ? "step" : undefined}
              className="grid h-11 w-6 place-items-center"
            >
              <span
                className={cn(
                  "accent-dot block h-2 rounded-full transition-all duration-300",
                  idx === i ? "w-6 bg-ink-900" : "w-2 bg-line-mist/60",
                )}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(i + 1)}
          disabled={i === n - 1}
          aria-label={labels.next}
          className="grid h-11 w-11 place-items-center rounded-pill bg-ink-900 text-paper-50 transition-opacity disabled:opacity-35"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
      </div>

      {/* Autoplay progress (time until the next step). Always rendered (same SSR/client markup); hidden with reduced motion. */}
      <div aria-hidden className="relative -mt-2 h-0.5 overflow-hidden rounded-full bg-line-mist/30 motion-reduce:hidden">
        <span
          key={`${i}-${autoplay}`}
          className={cn("accent-bar absolute inset-y-0 left-0 w-full origin-left rounded-full bg-ink-900", autoplay ? "carousel-progress" : "scale-x-0")}
          style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
        />
      </div>
    </div>
  );
}
