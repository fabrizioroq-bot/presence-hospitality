"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { NumberBadge } from "@/components/ui/Labels";
import type { ChapterMeta, ShellStrings } from "./shell-types";

/** The "O" overview: every chapter as a card; Enter or click jumps there, Esc closes. */
export function Overview({
  chapters,
  current,
  strings,
  onJump,
  onClose,
}: {
  chapters: ChapterMeta[];
  current: number;
  strings: ShellStrings;
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
        <h2 id="pitch-overview-title" className="text-slide-h3">
          {strings.overviewTitle}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-pill px-4 text-[0.9375rem] font-semibold ring-[1.5px] ring-ui-line/60 hover:bg-ui-hover"
        >
          {strings.closeOverview}
        </button>
      </div>
      <ol className="grid flex-1 grid-cols-2 gap-[calc(var(--slide-u)*1.6)] lg:grid-cols-4">
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
    </div>
  );
}
