"use client";

import { useEffect } from "react";
import { scrollToHash, setLenis } from "@/lib/smooth-scroll";

/**
 * Site-wide smooth scrolling (Lenis) + in-page anchor handling.
 * Wheel/trackpad only: touch keeps native momentum; reduced motion keeps native scroll.
 * Lenis is loaded on the first mouse/wheel input (not part of the initial bundle; phones never load it).
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: import("lenis").default | null = null;
    let disposed = false;
    const boot = (e: Event) => {
      if (e.type === "pointermove" && (e as PointerEvent).pointerType !== "mouse") return;
      window.removeEventListener("pointermove", boot);
      window.removeEventListener("wheel", boot);
      import("lenis").then(({ default: Lenis }) => {
        if (disposed) return;
        lenis = new Lenis({ lerp: 0.1, autoRaf: true, respectReducedMotion: true });
        setLenis(lenis);
      });
    };
    if (!reduce) {
      window.addEventListener("pointermove", boot, { passive: true });
      window.addEventListener("wheel", boot, { passive: true });
    }

    // Delegate clicks on same-page hash links (navbar, CTAs, footer, skip link).
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      if (scrollToHash(url.hash)) e.preventDefault();
    };
    document.addEventListener("click", onClick);

    // Deep link on load (e.g. /en#faq) once layout has settled.
    if (window.location.hash) requestAnimationFrame(() => scrollToHash(window.location.hash));

    return () => {
      disposed = true;
      window.removeEventListener("pointermove", boot);
      window.removeEventListener("wheel", boot);
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);
  return null;
}
