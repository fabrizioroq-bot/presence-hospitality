"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { scrollToHash, setLenis } from "@/lib/smooth-scroll";

/**
 * Site-wide smooth scrolling (Lenis) + in-page anchor handling.
 * Wheel/trackpad only: touch keeps native momentum; reduced motion keeps native scroll.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = reduce ? null : new Lenis({ lerp: 0.1, autoRaf: true, respectReducedMotion: true });
    setLenis(lenis);

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
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);
  return null;
}
