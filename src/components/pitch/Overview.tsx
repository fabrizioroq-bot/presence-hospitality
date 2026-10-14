"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { NumberBadge } from "@/components/ui/Labels";
import type { ChapterMeta, PresenterGuide, ShellStrings } from "./shell-types";

/** The "O" overview: every chapter as a card; Enter or click jumps there, Esc closes. */
export function Overview({
  chapters,
  current,
  strings,
  isOffline,
  guide,
  onJump,
  onClose,
}: {
  chapters: ChapterMeta[];
  current: number;
  strings: ShellStrings;
  /** The pitch is cached for offline use (presenter-only indicator). */
  isOffline: boolean;
  guide: PresenterGuide;
  onJump: (chapter: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLButtonElement>("[aria-current]")?.focus();
    return () => opener?.focus();
  }, []);

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pitch-overview-title"
      className="absolute inset-0 z-40 flex flex-col gap-[calc(var(--slide-u)*3)] overflow-auto bg-ui-bg px-[calc(var(--slide-u)*5)] py-[calc(var(--slide-u)*4)]"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <h2 id="pitch-overview-title" className="text-slide-h3">
            {strings.overviewTitle}
          </h2>
          {isOffline && (
            <span role="img" aria-label={strings.offlineReady} title={strings.offlineReady} className="text-ui-muted">
              <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5.5 15.5h9a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 5.2 9.3 3.1 3.1 0 0 0 5.5 15.5Z" />
                <path d="m7.8 11.8 1.6 1.6 3-3.2" />
              </svg>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-pill px-4 text-[0.9375rem] font-semibold ring-[1.5px] ring-ui-line/60 hover:bg-ui-hover"
        >
          {strings.closeOverview}
        </button>
      </div>
      <div className="grid flex-1 gap-[calc(var(--slide-u)*2.4)] lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
      <ol className="grid grid-cols-2 gap-[calc(var(--slide-u)*1.6)] lg:grid-cols-4">
        {chapters.map((c, i) => (
          <li key={c.id} data-theme={c.tone === "dark" ? "pitch-dark" : "pitch"} className="rounded-lg">
            <button
              type="button"
              onClick={() => onJump(i)}
              aria-current={i === current ? "step" : undefined}
              className="h-full w-full rounded-lg text-left"
            >
              <Card
                variant={i === current ? "highlight" : "outline"}
                className="flex h-full min-h-[calc(var(--slide-u)*14)] flex-col justify-between gap-4 p-[calc(var(--slide-u)*1.8)]"
              >
                <NumberBadge n={i + 1} isLit={i === current} />
                <span className="text-slide-h3">{c.title}</span>
              </Card>
            </button>
          </li>
        ))}
      </ol>
      <section aria-labelledby="pitch-guide-title" className="flex flex-col gap-3">
        <h3 id="pitch-guide-title" className="text-[1.25rem] font-black">
          {guide.title}
        </h3>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-[1rem] leading-snug text-ui-ink-2">
          {guide.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      </div>
    </div>
  );
}
