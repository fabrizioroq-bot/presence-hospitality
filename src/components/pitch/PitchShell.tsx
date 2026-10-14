"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CHAPTERS, LAST, TOTAL_STEPS, fromHash, globalStep, next, prev, reachedSteps, toHash, type Tone } from "./chapters";
import { ChapterRail } from "./ChapterRail";
import { Overview } from "./Overview";
import { PresenterControls } from "./PresenterControls";
import { getPitch, setPitch, usePitch } from "./pitch-store";
import { fmt, type ChapterMeta, type ShellStrings } from "./shell-types";
import { useFullscreen } from "./use-fullscreen";
import { useOffline } from "./use-offline";
import { usePresenterKeys, type PresenterAction } from "./use-presenter-keys";

// The WebGL stage (three.js + R3F) loads after first paint, in its own chunk.
const PitchStage = dynamic(() => import("./stage/PitchStage"), {
  ssr: false,
  loading: () => <div aria-hidden className="pitch-fallback absolute inset-0" />,
});

const themeOf = (tone: Tone) => (tone === "dark" ? "pitch-dark" : "pitch");
const INTERACTIVE = "a, button, input, select, textarea, label, [role='slider'], [role='button'], [data-no-advance]";

export function PitchShell({ chapters, strings, slides }: { chapters: ChapterMeta[]; strings: ShellStrings; slides: ReactNode[] }) {
  const root = useRef<HTMLDivElement>(null);
  const pos = usePitch();
  const [isOverview, setIsOverview] = useState(false);
  const [isBlank, setIsBlank] = useState(false);
  const { isFullscreen, toggle: toggleFullscreen, error: fullscreenError } = useFullscreen(root);
  const isOffline = useOffline();
  const current = chapters[pos.chapter];

  // Hash ⇄ position: jump straight to #problem (or #cover/2); keep the hash in sync while presenting.
  useEffect(() => {
    const sync = () => {
      const p = fromHash(location.hash);
      if (p) setPitch(p);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    const hash = toHash(pos);
    if (location.hash !== hash) history.replaceState(null, "", hash);
  }, [pos]);

  const go = useCallback((move: (p: typeof pos) => { chapter: number; step: number }) => setPitch(move(getPitch())), []);

  const onAction = (action: PresenterAction) => {
    if (isBlank) {
      setIsBlank(false); // any key brings the screen back
      return;
    }
    if (action === "fullscreen") return void toggleFullscreen();
    if (action === "overview") return setIsOverview((v) => !v);
    if (action === "escape") return setIsOverview(false);
    if (action === "blank") return setIsBlank(true);
    if (isOverview) return; // the overview grid owns arrows and Enter
    if (action === "next") go(next);
    else if (action === "prev") go(prev);
    else if (action === "first") setPitch({ chapter: 0, step: 0 });
    else if (action === "last") setPitch({ chapter: LAST, step: CHAPTERS[LAST].steps - 1 });
  };
  usePresenterKeys(onAction);

  const onStageClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest(INTERACTIVE) || getSelection()?.toString()) return;
    go(next);
  };

  const jump = (chapter: number) => {
    setPitch({ chapter, step: 0 });
    setIsOverview(false);
  };

  return (
    <div
      ref={root}
      data-slide-scale
      data-theme={themeOf(current.tone)}
      aria-roledescription="presentation"
      aria-label={strings.label}
      className="fixed inset-0 isolate overflow-hidden select-none"
    >
      <PitchStage />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-[calc(var(--slide-u)*4)] pt-[calc(var(--slide-u)*2.6)]">
        <SectionHeader
          size="slide"
          hasRule={pos.chapter === 0}
          meta={`${fmt(strings.counter, { n: pos.chapter + 1, total: chapters.length })} · ${current.title}`}
        />
      </div>

      <div
        role="progressbar"
        aria-label={strings.progress}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={globalStep(pos) + 1}
        className="absolute inset-x-0 top-0 z-30 h-[3px] bg-ui-rule/15"
      >
        <div
          className="h-full origin-left bg-ui-ink transition-transform duration-(--dur-base) ease-out"
          style={{ transform: `scaleX(${(globalStep(pos) + 1) / TOTAL_STEPS})` }}
        />
      </div>

      <main className="absolute inset-0 z-10" onClick={onStageClick}>
        {slides.map((slide, i) => (
          <section
            key={chapters[i].id}
            id={`chapter-${chapters[i].id}`}
            data-theme={themeOf(chapters[i].tone)}
            data-state={i === pos.chapter ? "active" : i < pos.chapter ? "before" : "after"}
            data-reached={reachedSteps(i, pos)}
            inert={i !== pos.chapter}
            className="pitch-chapter bg-transparent"
          >
            {slide}
          </section>
        ))}
      </main>

      <ChapterRail chapters={chapters} current={pos.chapter} strings={strings} onJump={jump} />
      <PresenterControls
        strings={strings}
        isFullscreen={isFullscreen}
        fullscreenError={fullscreenError}
        isOffline={isOffline}
        onPrev={() => go(prev)}
        onNext={() => go(next)}
        onOverview={() => setIsOverview(true)}
        onFullscreen={toggleFullscreen}
      />
      {isOverview && (
        <Overview chapters={chapters} current={pos.chapter} strings={strings} onJump={jump} onClose={() => setIsOverview(false)} />
      )}
      {isBlank && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-night-900" onClick={() => setIsBlank(false)}>
          <p className="sr-only" role="status">
            {strings.blank}
          </p>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {fmt(strings.chapterOf, { n: pos.chapter + 1, total: chapters.length, title: current.title })}
      </p>
    </div>
  );
}
