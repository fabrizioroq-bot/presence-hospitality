"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { IntakeLang } from "@/content/onboarding-form";
import { join as cx } from "./ui";
import { fill, type IntakeStrings } from "@/lib/intake/format";
import type { SaveStatus } from "./useIntakeAutosave";

export type StepChip = { label: string; name: string; isDone: boolean };

const STATUS_KEY: Partial<Record<SaveStatus, keyof IntakeStrings>> = {
  saving: "saving",
  saved: "saved",
  offline: "offline",
  retrying: "retrying",
  locked: "locked",
};

export function IntakeStepBar({
  logo,
  steps,
  current,
  onGo,
  progress,
  status,
  lang,
  langHrefs,
  strings,
}: {
  /** Rendered on the server (keeps the site's Logo module out of this client bundle). */
  logo: ReactNode;
  steps: StepChip[];
  current: number;
  onGo: (step: number) => void;
  progress: number;
  status: SaveStatus;
  lang: IntakeLang;
  langHrefs: Record<IntakeLang, string>;
  strings: IntakeStrings;
}) {
  const nav = useRef<HTMLOListElement>(null);
  const statusKey = STATUS_KEY[status];
  const isWarning = status === "offline" || status === "retrying" || status === "locked";

  // Keep the current chip visible when the row scrolls (phones).
  useEffect(() => {
    nav.current?.children[current]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [current]);

  return (
    <header className="sticky top-0 z-40 border-b border-(--ph-border-subtle) bg-(--ph-bg-page)/90 backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pt-3 pb-3 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          {logo}
          <div className="flex items-center gap-4">
            <p
              aria-live="polite"
              className={cx("flex items-center gap-2 text-body-sm", isWarning ? "text-(--ph-warning)" : "text-(--ph-text-muted)")}
            >
              {status === "saved" && (
                <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 text-(--ph-success)" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3.5 8.5 3 3 6-7" />
                </svg>
              )}
              {statusKey ? strings[statusKey] : null}
            </p>
            <nav aria-label={strings.language} className="flex text-body-sm font-semibold">
              {(["en", "nl"] as const).map((l) => (
                <a
                  key={l}
                  href={langHrefs[l]}
                  hrefLang={l}
                  aria-current={l === lang ? "true" : undefined}
                  className={cx(
                    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-pill px-2 uppercase",
                    l === lang ? "text-(--ph-brand-primary) underline underline-offset-4" : "text-(--ph-text-muted) hover:text-(--ph-text-primary)",
                  )}
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ol ref={nav} aria-label={strings.sections} className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 py-0.5 [scrollbar-width:none]">
            {steps.map((s, i) => (
              <li key={s.name}>
                <button
                  type="button"
                  onClick={() => onGo(i)}
                  aria-current={i === current ? "step" : undefined}
                  aria-label={s.name}
                  title={s.name}
                  data-done={s.isDone || undefined}
                  className="intake-step"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ol>
          <span className="hidden shrink-0 text-body-sm text-(--ph-text-secondary) tabular-nums sm:inline">
            {fill(strings.progress, { p: progress })}
          </span>
        </div>
        <div className="intake-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={fill(strings.progress, { p: progress })}>
          <span style={{ "--p": progress / 100 } as React.CSSProperties} />
        </div>
      </div>
    </header>
  );
}
