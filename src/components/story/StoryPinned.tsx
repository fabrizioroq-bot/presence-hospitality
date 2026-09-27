"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { interp, trackScroll, Value } from "@/lib/anim";
import { cx as cn } from "@/lib/cx";
import { useNear } from "@/lib/hooks";
import { afterLoadIdle, loadStoryCanvas, preloadStory } from "@/lib/preload";
import { hasWebGL2 } from "@/lib/perf-tier";
import { FLOOR, DOOR, HOLOBOX, KIOSK, STEPS, pctX, pctY, timeline } from "./layout";
import { LobbySketch } from "./LobbySketch";

const StoryCanvas = dynamic(loadStoryCanvas, { ssr: false });

export type StoryLabels = {
  step: string;
  steps: { title: string; body: string }[];
  kiosk: { welcome: string; lastName: string; booking: string; checkIn: string; alert: string; alertHint: string; calling: string; done: string };
  scene: { entrance: string; kiosk: string; holobox: string; hub: string; tap: string; live: string };
  sceneDesc: string;
};

type Phase = "welcome" | "typing" | "alert" | "calling" | "done";
const phaseOf = (s: number): Phase => {
  const t = timeline(s);
  if (t.done > 0.5) return "done";
  if (t.alert > 0.5 && s >= 3.3) return "calling";
  if (t.alert > 0.5) return "alert";
  if (s >= 1.05) return "typing";
  return "welcome";
};

/** Scroll window of step i: sequential, never overlapping (out over [i+0.84, i+0.94], next in over [i+0.95, i+1.06]). */
function stepStyle(v: number, i: number) {
  const first = i === 0;
  const last = i === STEPS - 1;
  const input = first ? [0, 0.84, 0.94] : last ? [i - 0.05, i + 0.06, STEPS] : [i - 0.05, i + 0.06, i + 0.84, i + 0.94];
  const opacity = interp(v, input, first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0]);
  const y = interp(v, input, first ? [0, 0, -24] : last ? [24, 0, 0] : [24, 0, 0, -24]);
  return { opacity, y };
}

/** Step copy that fades/rises in its own scroll window (styles written by StoryPinned). */
function StepText({ i, step, label, title, body, liRef }: { i: number; step: number; label: string; title: string; body: string; liRef: (el: HTMLLIElement | null) => void }) {
  const init = stepStyle(0, i);
  return (
    <li
      ref={liRef}
      style={{ opacity: init.opacity, transform: `translateY(${init.y}px)` }}
      aria-current={step === i ? "step" : undefined}
      className="absolute inset-x-0 top-0 flex flex-col gap-4"
    >
      <span className="step-num text-label text-ink-500">
        {label} {String(i + 1).padStart(2, "0")} / {String(STEPS).padStart(2, "0")}
      </span>
      <h3 className="text-display-lg text-ink-900">{title}</h3>
      <p className="max-w-[40ch] text-body-lg text-ink-700">{body}</p>
    </li>
  );
}

/** Desktop: the section pins while the guest journey plays out, driven by scroll (s = 0..6). */
export function StoryPinned({ labels }: { labels: StoryLabels }) {
  const track = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const figRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  // s = 0..STEPS across the pinned track; shared with the WebGL scene.
  const [s] = useState(() => new Value(0));

  const [step, setStep] = useState(0);
  const [posterS, setPosterS] = useState(0);
  const readyRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("welcome");
  const [flags, setFlags] = useState({ tap: false, live: false, hub: false });
  const onS = useCallback((v: number) => {
    const i = Math.min(STEPS - 1, Math.max(0, Math.floor(v)));
    setStep((p) => (p === i ? p : i));
    const ph = phaseOf(v);
    setPhase((p) => (p === ph ? p : ph));
    const t = timeline(v);
    const next = { tap: v > 2.5 && v < 3.95, live: t.agent > 0.95, hub: t.flow > 0.3 };
    setFlags((f) => (f.tap === next.tap && f.live === next.live && f.hub === next.hub ? f : next));
    // Until WebGL paints, the SVG poster follows the scroll too (no frozen or unstyled frame).
    if (!readyRef.current) setPosterS(Math.round(v * 40) / 40);
  }, []);

  // Scroll → s, rail fill and step copy (written to the DOM), plus the stage easing in.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const offMain = trackScroll(el, ["start start", "end end"], (p) => {
      const v = p * STEPS;
      s.set(v);
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      stepRefs.current.forEach((li, i) => {
        if (!li) return;
        const st = stepStyle(v, i);
        li.style.opacity = String(st.opacity);
        li.style.transform = `translateY(${st.y}px)`;
      });
      onS(v);
    });
    const offEnter = trackScroll(el, ["start end", "start start"], (p) => {
      const f = figRef.current;
      if (!f) return;
      f.style.transform = `scale(${interp(p, [0, 1], [0.92, 1])})`;
      f.style.opacity = String(interp(p, [0, 0.6], [0.4, 1]));
    });
    return () => {
      offMain();
      offEnter();
    };
  }, [s, onS]);

  // WebGL (desktop, WebGL2, motion allowed). Assets are prefetched right after the first
  // interaction, the canvas mounts well before the section (or instantly on a navbar jump),
  // and it only renders while visible.
  const [load, setLoad] = useState(false);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  // Unmount the WebGL scene when the story is far off-screen; the SVG poster takes over again.
  const onFar = useCallback(() => {
    readyRef.current = false;
    setReady(false);
  }, []);
  const near = useNear(track, "150% 0px", onFar);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ok =
      window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)").matches && hasWebGL2();
    if (!ok) return;

    // Assets download while the hero is still on screen (right after load), so the scene is
    // ready before the reader reaches the story.
    const prefetch = preloadStory;
    afterLoadIdle(prefetch);

    // Navbar / in-page links to this section: start immediately.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href$="#how-it-works"]');
      if (a) {
        prefetch();
        setLoad(true);
      }
    };
    document.addEventListener("click", onClick, true);

    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          prefetch();
          setLoad(true);
        }
      },
      { rootMargin: "150% 0px" },
    );
    near.observe(el);
    return () => {
      document.removeEventListener("click", onClick, true);
      near.disconnect();
    };
  }, []);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const vis = new IntersectionObserver(([e]) => setActive(e.isIntersecting && !document.hidden));
    vis.observe(el);
    return () => vis.disconnect();
  }, []);
  const onReady = useCallback(() => {
    readyRef.current = true;
    setReady(true);
  }, []);

  const k = labels.kiosk;
  const scr = KIOSK.screen;
  const show = (p: Phase | Phase[]) => ((Array.isArray(p) ? p : [p]).includes(phase) ? "opacity-100" : "opacity-0");

  return (
    <div ref={track} className="relative" style={{ height: `${STEPS * 100 + 40}svh` }}>
      <div className="sticky top-0 flex h-svh items-center pt-(--nav-h)">
        <div className="container-site grid w-full grid-cols-12 items-center gap-6">
          {/* Rail + step copy */}
          <div className="col-span-4 flex gap-8">
            <div aria-hidden className="relative flex flex-col items-center gap-5 py-1">
              <span className="absolute top-4 bottom-4 left-1/2 w-px -translate-x-1/2 bg-line-mist/40" />
              <span ref={fillRef} style={{ transform: "scaleY(0)" }} className="accent-line absolute top-4 bottom-4 left-1/2 w-px origin-top -translate-x-1/2 bg-ink-900" />
              {labels.steps.map((_, i) => (
                <span
                  key={i}
                  data-lit={i <= step ? "" : undefined}
                  className={cn(
                    "step-node relative grid h-9 w-9 place-items-center rounded-pill text-label transition-colors duration-300",
                    i <= step ? "bg-ink-900 text-paper-50" : "bg-mist-surface text-ink-700 ring-1 ring-line-mist",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              ))}
            </div>
            <ol className="relative min-h-[340px] flex-1">
              {labels.steps.map((st, i) => (
                <StepText
                  key={i}
                  i={i}
                  step={step}
                  label={labels.step}
                  title={st.title}
                  body={st.body}
                  liRef={(el) => {
                    stepRefs.current[i] = el;
                  }}
                />
              ))}
            </ol>
          </div>

          {/* Stage */}
          <div className="col-span-8 flex justify-end">
            <figure
              ref={figRef}
              style={{ transform: "scale(0.92)", opacity: 0.4, width: "min(100%, calc((100svh - var(--nav-h) - 96px) * 1.6))" }}
              className="@container relative aspect-[16/10] overflow-hidden rounded-xl bg-night-900 shadow-soft ring-1 ring-white/5"
            >
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "radial-gradient(70% 55% at 55% 100%, rgba(47,127,208,0.18) 0%, rgba(18,20,23,0) 70%)" }}
              />
              {/* SVG poster / fallback until WebGL paints */}
              <div className={cn("absolute inset-0 transition-opacity duration-700", ready ? "opacity-0" : "opacity-100")}>
                <LobbySketch s={posterS} />
              </div>
              {load && near && <StoryCanvas s={s} active={active} onReady={onReady} />}

              {/* Kiosk screen (real text, aligned to the scene) */}
              <div
                aria-hidden
                className="absolute overflow-hidden rounded-[1.2cqw] text-paper-50"
                style={{
                  left: `${pctX(scr.x0)}%`,
                  top: `${pctY(scr.y1)}%`,
                  width: `${((scr.x1 - scr.x0) / 16) * 100}%`,
                  height: `${((scr.y1 - scr.y0) / 10) * 100}%`,
                }}
              >
                <div className="absolute inset-0 bg-night-800/85" />
                <div className={cn("absolute inset-0 flex flex-col gap-[0.7cqw] p-[1.1cqw] transition-opacity duration-500", show(["welcome", "typing"]))}>
                  <span className="text-[1.25cqw] font-extrabold tracking-[-0.02em]">{k.welcome}</span>
                  {[k.lastName, k.booking].map((f, i) => (
                    <span key={f} className="flex flex-col gap-[0.2cqw]">
                      <span className="text-[max(7px,0.72cqw)] text-paper-500">{f}</span>
                      <span className="relative h-[1.5cqw] rounded-[0.3cqw] bg-white/8 ring-1 ring-white/15">
                        <span
                          className="absolute inset-y-0 left-[0.5cqw] flex items-center overflow-hidden text-[1cqw] tracking-[0.2em] text-holo-300 transition-[width] duration-700 ease-out"
                          style={{ width: phase === "typing" ? "70%" : "0%", transitionDelay: `${i * 450}ms` }}
                        >
                          ••••••••
                        </span>
                      </span>
                    </span>
                  ))}
                  <span className="mt-auto rounded-pill bg-paper-50 py-[0.3cqw] text-center text-[0.8cqw] font-semibold text-ink-900">
                    {k.checkIn}
                  </span>
                </div>
                <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-[0.6cqw] p-[1.1cqw] text-center transition-opacity duration-500", show(["alert", "calling"]))}>
                  <span className="grid h-[2.6cqw] w-[2.6cqw] place-items-center rounded-full bg-amber-400 text-[1.5cqw] font-extrabold text-ink-900 shadow-glow-amber">!</span>
                  <span className="text-[1cqw] font-semibold">{k.alert}</span>
                  <span className="text-[max(7px,0.72cqw)] text-paper-300">{phase === "calling" ? k.calling : k.alertHint}</span>
                </div>
                <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-[0.6cqw] text-center transition-opacity duration-500", show("done"))}>
                  <span className="grid h-[2.6cqw] w-[2.6cqw] place-items-center rounded-full bg-success-night text-ink-900">
                    <svg viewBox="0 0 16 16" className="h-[1.4cqw] w-[1.4cqw]" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 8.5l3 3 6-7" />
                    </svg>
                  </span>
                  <span className="text-[1cqw] font-semibold">{k.done}</span>
                </div>
              </div>

              {/* Scene labels */}
              <div aria-hidden className="pointer-events-none absolute inset-0 font-mono text-[max(9px,0.8cqw)] font-medium tracking-[0.14em] text-paper-500 uppercase">
                <span className="absolute -translate-x-1/2" style={{ left: `${pctX((DOOR.x0 + DOOR.x1) / 2)}%`, top: `${pctY(FLOOR) + 3}%` }}>
                  {labels.scene.entrance}
                </span>
                <span className="absolute -translate-x-1/2" style={{ left: `${pctX((scr.x0 + scr.x1) / 2)}%`, top: `${pctY(FLOOR) + 3}%` }}>
                  {labels.scene.kiosk}
                </span>
                <span className="absolute -translate-x-1/2" style={{ left: `${pctX(HOLOBOX.cx)}%`, top: `${pctY(FLOOR) + 3}%` }}>
                  {labels.scene.holobox}
                </span>
                <span className={cn("absolute top-[5%] right-[3%] inline-flex items-center gap-[0.5cqw] transition-colors duration-500", flags.hub && "text-holo-300")}>
                  <span className={cn("h-[0.6cqw] w-[0.6cqw] rounded-full", flags.hub ? "live-dot" : "bg-line-night")} />
                  {labels.scene.hub}
                </span>
                <span
                  className={cn("absolute -translate-x-1/2 rounded-pill bg-holo-gradient px-[0.8cqw] py-[0.35cqw] text-ink-900 transition-opacity duration-500", flags.tap ? "opacity-100" : "opacity-0")}
                  style={{ left: `${pctX(HOLOBOX.cx)}%`, top: `${pctY(0.2)}%` }}
                >
                  {labels.scene.tap}
                </span>
                <span
                  className={cn("absolute inline-flex -translate-x-1/2 items-center gap-[0.5cqw] text-paper-300 transition-opacity duration-500", flags.live ? "opacity-100" : "opacity-0")}
                  style={{ left: `${pctX(HOLOBOX.cx)}%`, top: `${pctY(HOLOBOX.y1) + 3}%` }}
                >
                  <span className="live-dot !h-[0.6cqw] !w-[0.6cqw]" />
                  {labels.scene.live}
                </span>
              </div>
              <figcaption className="sr-only">{labels.sceneDesc}</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
}
