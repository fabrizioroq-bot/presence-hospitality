"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { intakeSave } from "./api";
import type { Answers } from "@/lib/intake/answers";

export type SaveStatus = "idle" | "saving" | "saved" | "offline" | "retrying" | "locked";
/** Server verdicts that end editing: the page reloads to show the right screen. */
export type LockReason = "expired" | "revoked" | "submitted" | "not_found";

const DEBOUNCE_MS = 800;
const RETRY_MS = 5000;
const RATE_LIMIT_RETRY_MS = 15000;

// ---- Local draft (backup on this device) --------------------------------------------------------
type Draft = { answers: Answers; at: string; synced: boolean };
const draftKey = (token: string) => `ph-intake:${token.slice(0, 16)}`;

export function readDraft(token: string): Draft | null {
  try {
    const raw = window.localStorage.getItem(draftKey(token));
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

function writeDraft(token: string, draft: Draft) {
  try {
    window.localStorage.setItem(draftKey(token), JSON.stringify(draft));
  } catch {
    // Storage full or blocked: the server copy is still the source of truth.
  }
}

export function clearDraft(token: string) {
  try {
    window.localStorage.removeItem(draftKey(token));
  } catch {
    // Nothing to clear.
  }
}

/**
 * Saves the answers ~800 ms after the last change. Every change is written to localStorage first,
 * so nothing is lost offline; failed saves retry on a timer and as soon as the browser is back online.
 */
export function useIntakeAutosave(token: string, answers: Answers, onLocked: (reason: LockReason) => void) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const latest = useRef(answers);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirst = useRef(true);
  const onLockedRef = useRef(onLocked);

  useEffect(() => {
    onLockedRef.current = onLocked;
  }, [onLocked]);

  // Retries go through a ref, so save() can schedule itself again.
  const saveRef = useRef<() => Promise<void>>(async () => {});
  const schedule = useCallback((ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void saveRef.current(), ms);
  }, []);

  const save = useCallback(async () => {
    if (!navigator.onLine) {
      setStatus("offline");
      return; // the "online" listener retries
    }
    const sending = latest.current;
    setStatus("saving");
    try {
      const res = await intakeSave(token, sending);
      if (res.status === "ok") {
        if (latest.current === sending) writeDraft(token, { answers: sending, at: new Date().toISOString(), synced: true });
        setStatus(latest.current === sending ? "saved" : "saving");
        return;
      }
      if (res.status === "rate_limited") {
        setStatus("retrying");
        schedule(RATE_LIMIT_RETRY_MS);
        return;
      }
      if (res.status === "expired" || res.status === "revoked" || res.status === "submitted" || res.status === "not_found") {
        setStatus("locked");
        onLockedRef.current(res.status);
        return;
      }
      setStatus("retrying");
      schedule(RETRY_MS);
    } catch {
      setStatus(navigator.onLine ? "retrying" : "offline");
      schedule(RETRY_MS);
    }
  }, [token, schedule]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  // Each change: local draft now, server save after the pause.
  useEffect(() => {
    latest.current = answers;
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    writeDraft(token, { answers, at: new Date().toISOString(), synced: false });
    schedule(DEBOUNCE_MS);
  }, [answers, token, schedule]);

  useEffect(() => {
    const flushIfPending = () => {
      if (readDraft(token)?.synced === false) void save();
    };
    // Leaving the tab or closing the laptop: don't wait for the pause.
    const onHidden = () => document.visibilityState === "hidden" && flushIfPending();
    window.addEventListener("online", flushIfPending);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.removeEventListener("online", flushIfPending);
      document.removeEventListener("visibilitychange", onHidden);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [token, save]);

  return status;
}
