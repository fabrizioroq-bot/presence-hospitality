"use client";

import { fetchBin } from "@/lib/bin-cache";
import { tierConfig, type Tier } from "@/lib/perf-tier";

/**
 * Asset preloading, so sections are ready before the reader reaches them.
 * Point clouds go through the shared bin cache (the scenes reuse the same download); modules are
 * imported (downloaded + evaluated) ahead of mounting.
 */
export function prefetch(url: string) {
  fetchBin(url, "low").catch(() => {});
}

export const loadHeroCanvas = () => import("@/components/hologram/HeroCanvas");
export const loadStoryCanvas = () => import("@/components/story/StoryCanvas");

// Rule: before the first interaction only data is fetched (network, nothing executes — keeps the
// initial JS budget and Lighthouse clean); code (three.js scenes) loads from the first interaction on.

/** Hero / Holobox stage point cloud for this device's tier (data only). */
export function prefetchHologramData(tier: Tier) {
  prefetch(`/hologram/${tierConfig[tier].file}`);
}
/** Hero / Holobox stage: data + scene module. */
export function preloadHologram(tier: Tier) {
  prefetchHologramData(tier);
  loadHeroCanvas().catch(() => {});
}

/** Pinned "How it works" story (desktop): data only. */
export function prefetchStoryData() {
  prefetch("/hologram/guest-9k.bin");
  prefetch("/hologram/agent-12k.bin");
}
/** Story: data + scene module. */
export function preloadStory() {
  prefetchStoryData();
  loadStoryCanvas().catch(() => {});
}

/** Runs `fn` on the first interaction (also one made before hydration, see boot script). */
export function onFirstInteraction(fn: () => void) {
  if (interacted()) {
    fn();
    return () => {};
  }
  window.addEventListener("ph:interact", fn, { once: true });
  return () => window.removeEventListener("ph:interact", fn);
}

/** Runs `fn` once the page has loaded and the main thread is idle. */
export function afterLoadIdle(fn: () => void, timeout = 2000) {
  const idle = () => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => fn(), { timeout });
    else setTimeout(fn, 200);
  };
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
}

type PhWindow = Window & { __phI?: boolean };
/** True if the reader already interacted (recorded by the inline boot script, even before hydration). */
export const interacted = () => (window as PhWindow).__phI === true;
/** The intro loader is showing (first visit of the session). */
export const introActive = () => document.documentElement.classList.contains("intro");
