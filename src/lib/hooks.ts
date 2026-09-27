"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

const RM = "(prefers-reduced-motion: reduce)";
const subscribeRM = (cb: () => void) => {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** `prefers-reduced-motion`, false during SSR/hydration (then corrected without a mismatch). */
export function useReducedMotion() {
  return useSyncExternalStore(subscribeRM, () => window.matchMedia(RM).matches, () => false);
}

/** True once `amount` of the element has been visible (like Motion's `useInView({ once: true })`). */
export function useInView(ref: RefObject<Element | null>, amount = 0.3) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, amount, seen]);
  return seen;
}

/**
 * True while the element is within `margin` of the viewport. Used to unmount WebGL scenes that are
 * far off-screen (frees their GL context and GPU memory on Safari and low-end phones); `onFar` runs
 * when it leaves (e.g. to show the poster again until the scene repaints).
 */
export function useNear(ref: RefObject<Element | null>, margin = "150% 0px", onFar?: () => void) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setNear(e.isIntersecting);
        if (!e.isIntersecting) onFar?.();
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, onFar]);
  return near;
}
