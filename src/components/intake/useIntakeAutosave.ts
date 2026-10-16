"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { intakeSave } from "./api";
import type { Answers } from "@/lib/intake/answers";

export type SaveStatus = "idle" | "saving" | "saved" | "offline" | "retrying" | "locked";
/** Server verdicts that end editing: the page reloads to show the right screen. */
export type LockReason = "expired" | "revoked" | "submitted" | "not_found";

const DEBOUNCE_MS = 800;
const RETRY_MS = 5000;
/** Rate limited (90 saves per token per minute on the server): back off 5 s, 10 s, 20 s … up to 60 s. */
const BACKOFF_BASE_MS = 5000;
const BACKOFF_MAX_MS = 60_000;
const backoffMs = (attempt: number) =>
  Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** attempt) + Math.round(Math.random() * 1000);

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
  /** While rate limited: no request before this time (ms since epoch), however much the client types. */
  const blockedUntil = useRef(0);
  const backoffAttempt = useRef(0);
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
        backoffAttempt.current = 0;
        if (latest.current === sending) writeDraft(token, { answers: sending, at: new Date().toISOString(), synced: true });
        setStatus(latest.current === sending ? "saved" : "saving");
        return;
      }
      if (res.status === "rate_limited") {
        // Not an error for the client: the local draft holds everything; keep "Saving…" and retry quietly.
        const wait = backoffMs(backoffAttempt.current++);
        blockedUntil.current = Date.now() + wait;
        setStatus("saving");
        schedule(wait);
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
    schedule(Math.max(DEBOUNCE_MS, blockedUntil.current - Date.now()));
  }, [answers, token, schedule]);

  useEffect(() => {
    const flushIfPending = () => {
      if (readDraft(token)?.synced === false && Date.now() >= blockedUntil.current) void save();
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
