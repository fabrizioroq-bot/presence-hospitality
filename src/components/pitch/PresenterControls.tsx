"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import type { ShellStrings } from "./shell-types";

const IDLE_MS = 2500;

/** Corner controls for mouse users. They fade out while presenting and return on mouse move or focus. */
export function PresenterControls({
  strings,
  isFullscreen,
  fullscreenError,
  onPrev,
  onNext,
  onOverview,
  onFullscreen,
}: {
  strings: ShellStrings;
  isFullscreen: boolean;
  fullscreenError: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOverview: () => void;
  onFullscreen: () => void;
}) {
  const [isIdle, setIsIdle] = useState(true);
  useEffect(() => {
    let timer = 0;
    const wake = () => {
      setIsIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIsIdle(true), IDLE_MS);
    };
    window.addEventListener("mousemove", wake);
    return () => {
      window.removeEventListener("mousemove", wake);
      window.clearTimeout(timer);
    };
  }, []);

  const button =
    "grid h-11 min-w-11 place-items-center rounded-pill px-3 text-[0.9375rem] font-semibold text-ui-ink ring-[1.5px] ring-ui-line/60 transition-colors duration-(--dur-fast) hover:bg-ui-hover";

  return (
    <div
      className={cx(
        "absolute right-[calc(var(--slide-u)*2)] bottom-[calc(var(--slide-u)*2)] z-30 flex flex-col items-end gap-2 transition-opacity duration-(--dur-base) focus-within:opacity-100",
        isIdle ? "opacity-0" : "opacity-100",
      )}
    >
      {fullscreenError && (
        <p role="status" className="text-slide-small text-ui-ink-2">
          {strings.fullscreenUnavailable}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button type="button" className={button} onClick={onPrev} aria-label={strings.prev}>
          <span aria-hidden>←</span>
        </button>
        <button type="button" className={button} onClick={onNext} aria-label={strings.next}>
          <span aria-hidden>→</span>
        </button>
        <button type="button" className={button} onClick={onOverview}>
          {strings.overview}
        </button>
        <button type="button" className={button} onClick={onFullscreen} aria-pressed={isFullscreen}>
          {isFullscreen ? strings.exitFullscreen : strings.fullscreen}
        </button>
      </div>
      <p className="text-slide-small text-ui-muted">{strings.help}</p>
    </div>
  );
}
