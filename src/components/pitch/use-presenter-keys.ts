"use client";

import { useEffect, useRef } from "react";

export type PresenterAction = "next" | "prev" | "first" | "last" | "fullscreen" | "overview" | "escape" | "blank";

/** Clickers send PageDown/PageUp (some send arrows, "b" or "."); keyboards use arrows and Space. */
const KEYS: Record<string, PresenterAction> = {
  ArrowRight: "next",
  ArrowDown: "next",
  PageDown: "next",
  " ": "next",
  Enter: "next",
  ArrowLeft: "prev",
  ArrowUp: "prev",
  PageUp: "prev",
  Home: "first",
  End: "last",
  f: "fullscreen",
  F: "fullscreen",
  o: "overview",
  O: "overview",
  Escape: "escape",
  b: "blank",
  B: "blank",
  ".": "blank",
};

/** Keys a focused control handles itself: Space/Enter on buttons and links, arrows in sliders and fields. */
function ownedByControl(key: string, target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.closest("input, textarea, select")) return true;
  if ((key === " " || key === "Enter") && target.closest("button, a, summary, [role='button']")) return true;
  if (key.startsWith("Arrow") && target.closest("[role='slider'], [role='radiogroup'], [role='tablist']")) return true;
  return false;
}

/** Calls `onAction` for presenter keys. The latest callback is always used (no re-subscribing). */
export function usePresenterKeys(onAction: (action: PresenterAction, event: KeyboardEvent) => void) {
  const handler = useRef(onAction);
  useEffect(() => {
    handler.current = onAction;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const action = KEYS[e.key];
      if (!action || ownedByControl(e.key, e.target)) return;
      e.preventDefault();
      handler.current(action, e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
