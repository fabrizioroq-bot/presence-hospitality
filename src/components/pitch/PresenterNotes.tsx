"use client";

import type { ShellStrings } from "./shell-types";

/**
 * Talking points for the current build (N toggles; hidden automatically in fullscreen until N is
 * pressed there). Notes live in messages (pitch.notes.<chapter>[step]) so they can be edited freely.
 */
export function PresenterNotes({
  points,
  chapterTitle,
  position,
  strings,
}: {
  points: string[];
  chapterTitle: string;
  /** "3 / 8 · 2" */
  position: string;
  strings: ShellStrings;
}) {
  return (
    <aside
      aria-label={strings.notes}
      className="absolute bottom-[calc(var(--slide-u)*2)] left-[calc(var(--slide-u)*2)] z-40 w-[min(34rem,40vw)] rounded-lg bg-ui-bg p-4 shadow-soft ring-[1.5px] ring-ui-line/40"
    >
      <p className="flex items-center justify-between gap-4 text-[0.875rem] font-semibold text-ui-muted">
        <span>{strings.notes}</span>
        <span className="tabular-nums">
          {position} · {chapterTitle}
        </span>
      </p>
      <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-[1rem] leading-snug text-ui-ink">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </aside>
  );
}
