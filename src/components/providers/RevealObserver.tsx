"use client";

import { useEffect } from "react";

/**
 * Starts CSS reveals (see Reveal.tsx): marks `[data-rv-trigger]` elements with `data-in` when
 * enough of them is visible (or on load for `data-rv-load`), numbering their items for the stagger.
 * Watches the DOM for new triggers (client-side navigation).
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("rv")) return;
    root.classList.add("rv-on");
    const observers = new Map<number, IntersectionObserver>();
    const seen = new WeakSet<Element>();

    const show = (el: Element) => {
      let i = 0;
      const items = el.matches("[data-rv]") ? [el] : [];
      // Items owned by this trigger (nested triggers run their own reveal).
      el.querySelectorAll("[data-rv]").forEach((it) => {
        if (it.closest("[data-rv-trigger]") === el) items.push(it);
      });
      items.forEach((it) => {
        const s = (it as HTMLElement).style;
        if (!s.getPropertyValue("--rv-i")) s.setProperty("--rv-i", String(i));
        i++;
      });
      requestAnimationFrame(() => el.setAttribute("data-in", ""));
    };
    const observerFor = (amount: number) => {
      let io = observers.get(amount);
      if (!io) {
        io = new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (e.isIntersecting) {
                io!.unobserve(e.target);
                show(e.target);
              }
            }),
          { threshold: amount },
        );
        observers.set(amount, io);
      }
      return io;
    };
    const SEL = "[data-rv-trigger]:not([data-in])";
    const handle = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (el.hasAttribute("data-rv-load")) show(el);
      else observerFor(parseFloat(el.getAttribute("data-rv-amount") ?? "0.3")).observe(el);
    };
    const scan = (scope: Element | Document) => {
      if (scope instanceof Element && scope.matches(SEL)) handle(scope);
      scope.querySelectorAll(SEL).forEach(handle);
    };
    scan(document);
    const mo = new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => n instanceof Element && scan(n));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      observers.forEach((io) => io.disconnect());
    };
  }, []);
  return null;
}
