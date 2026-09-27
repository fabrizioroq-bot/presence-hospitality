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

/** Hero / Holobox stage: the scene module + the point cloud for this device's tier. */
export function preloadHologram(tier: Tier) {
  prefetch(`/hologram/${tierConfig[tier].file}`);
  loadHeroCanvas().catch(() => {});
}

/** Pinned "How it works" story (desktop). */
export function preloadStory() {
  prefetch("/hologram/guest-9k.bin");
  prefetch("/hologram/agent-12k.bin");
  loadStoryCanvas().catch(() => {});
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
