"use client";

import { useSyncExternalStore } from "react";

/**
 * "Traditional front desk ↔ With Presence" (Our solution): 0 = traditional, 1 = with Presence.
 * The DOM slider writes it (drag or the presenter's builds); the WebGL stage reads it every frame.
 */
let value = 0;
const subs = new Set<() => void>();

export const getComparison = () => value;

export function setComparison(next: number) {
  const v = Math.min(1, Math.max(0, next));
  if (v === value) return;
  value = v;
  subs.forEach((cb) => cb());
}

const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
};

export function useComparison() {
  return useSyncExternalStore(subscribe, getComparison, () => 0);
}
