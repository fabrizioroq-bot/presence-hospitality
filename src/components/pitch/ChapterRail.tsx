"use client";

import { cx } from "@/lib/cx";
import { fmt, type ChapterMeta, type ShellStrings } from "./shell-types";

/** Chapter dots on the right edge: hidden while presenting, shown on hover or keyboard focus. */
export function ChapterRail({
  chapters,
  current,
  strings,
  onJump,
}: {
  chapters: ChapterMeta[];
  current: number;
  strings: ShellStrings;
  onJump: (chapter: number) => void;
}) {
  return (
    <nav
      aria-label={strings.rail}
      className="absolute inset-y-0 right-0 z-30 flex w-[calc(var(--slide-u)*6)] items-center justify-end pr-[calc(var(--slide-u)*1.4)] opacity-0 transition-opacity duration-(--dur-fast) hover:opacity-100 focus-within:opacity-100"
    >
      <ol className="flex flex-col">
        {chapters.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onJump(i)}
              aria-current={i === current ? "step" : undefined}
              aria-label={fmt(strings.goTo, { n: i + 1, title: c.title })}
              title={c.title}
              className="group grid h-11 w-11 place-items-center rounded-pill"
            >
              <span
                className={cx(
                  "block h-2.5 w-2.5 rounded-pill ring-[1.5px] ring-ui-ink transition-[background-color,scale] duration-(--dur-fast) group-hover:scale-125",
                  i === current ? "bg-ui-ink" : "bg-transparent",
                )}
              />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
