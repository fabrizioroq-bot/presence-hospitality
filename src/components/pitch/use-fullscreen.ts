"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

type LegacyDocument = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void> };
type LegacyElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };

const fullscreenElement = () => document.fullscreenElement ?? (document as LegacyDocument).webkitFullscreenElement ?? null;

/** Fullscreen on `ref` (standard API with the older WebKit prefix). `error` is set when it is refused. */
export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(fullscreenElement() !== null);
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  const toggle = useCallback(async () => {
    const el = ref.current as LegacyElement | null;
    if (!el) return;
    setError(false);
    try {
      if (fullscreenElement()) {
        const doc = document as LegacyDocument;
        await (document.exitFullscreen ? document.exitFullscreen() : doc.webkitExitFullscreen?.());
      } else if (el.requestFullscreen) {
        await el.requestFullscreen({ navigationUI: "hide" });
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else {
        setError(true);
      }
    } catch {
      // Refused (no user gesture, iframe policy, or unsupported): tell the presenter instead of failing silently.
      setError(true);
    }
  }, [ref]);

  return { isFullscreen, toggle, error };
}
