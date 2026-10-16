"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { sendAccessLink, type AccessLinkState } from "@/app/dashboard/actions";
import { cx } from "@/lib/cx";

const INIT: AccessLinkState = {};
const COPIED_MS = 2000;
const ghost = "inline-flex min-h-11 items-center gap-2 rounded-pill px-5 text-body-sm font-semibold ring-1 ring-line-night hover:bg-night-800";

/** "Generate link": emails a dashboard access link to any address, with copy / mail-app fallbacks. */
export function AccessLinkButton({ validDays }: { validDays: number }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState(sendAccessLink, INIT);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    if (!state.link) return;
    try {
      await navigator.clipboard.writeText(state.link);
      setCopied(true);
    } catch {
      // Clipboard blocked: the link stays selectable in the field below.
    }
  };

  return (
    <div ref={root} className="relative">
      <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)} className={ghost}>
        <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 9.5 9.5 6.5M7 4.5l1-1a2.83 2.83 0 0 1 4 4l-1 1M9 11.5l-1 1a2.83 2.83 0 0 1-4-4l1-1" />
        </svg>
        Generate link
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-x-4 top-20 z-50 rounded-xl border border-line-night bg-night-800 p-5 shadow-soft md:absolute md:inset-x-auto md:top-auto md:right-0 md:mt-2 md:w-[26rem]"
      >
        <form action={action} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-body-sm font-semibold">
            Send dashboard access to
            <input name="email" type="email" required autoComplete="off" placeholder="name@company.com" className="demo-input" />
          </label>
          <p className="text-body-sm text-paper-500">The person can sign in and open the leads and the pitch. The link works once, expires in {validDays} days and replaces any earlier link.</p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-paper-50 px-5 text-body-sm font-semibold text-ink-900 hover:bg-paper-300 disabled:opacity-60"
          >
            {pending && <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-ink-900/25 border-t-ink-900" />}
            Send link
          </button>
        </form>
        <div aria-live="polite">
          {(state.ok || state.error) && (
            <p
              role={state.error ? "alert" : "status"}
              className={cx(
                "mt-4 rounded-md border p-3 text-body-sm",
                state.error ? "border-danger-night/60 bg-danger-night/10" : "border-success-night/50 bg-success-night/10",
              )}
            >
              {state.ok ?? state.error}
            </p>
          )}
          {state.link && (
            <div className="mt-4 flex flex-col gap-2">
              <input readOnly value={state.link} aria-label="Access link" onFocus={(e) => e.currentTarget.select()} className="demo-input text-body-sm" />
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copy} className={ghost}>
                  {copied ? "Copied" : "Copy link"}
                </button>
                {state.mailto && (
                  <a href={state.mailto} className={ghost}>
                    Open in mail app
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
