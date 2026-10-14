"use client";

import { useEffect, useState } from "react";

const SW_URL = "/pitch-sw.js";
const SCOPE = "/dashboard/pitch";
const WARM_DELAY_MS = 5000; // after the 3D stage and fonts have loaded

/** Same-origin files the page has loaded so far (scripts, styles, fonts, point clouds) plus the page. */
function loadedUrls() {
  const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const urls = entries.map((e) => e.name).filter((u) => u.startsWith(location.origin));
  return [...new Set([...urls, location.origin + SCOPE])];
}

/**
 * Registers the pitch service worker (production only) and warms its cache with everything the page
 * used. Returns true once the pitch can be presented without a connection.
 */
export function useOffline() {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let timer = 0;
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "warmed") setIsReady(true);
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    navigator.serviceWorker
      .register(SW_URL, { scope: SCOPE })
      .then(async () => {
        const reg = await navigator.serviceWorker.ready;
        timer = window.setTimeout(() => reg.active?.postMessage({ type: "warm", urls: loadedUrls() }), WARM_DELAY_MS);
      })
      .catch((err: unknown) => {
        // The pitch still works online; only offline use is unavailable.
        console.warn("Pitch offline cache unavailable:", err);
      });
    return () => {
      window.clearTimeout(timer);
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);
  return isReady;
}
