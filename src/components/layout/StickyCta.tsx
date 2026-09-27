"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Mobile-only "Book a demo" bar. Appears after the first screen, hides while the footer or a
 * demo form is on screen, and respects the iOS home-indicator safe area.
 */
export function StickyCta({ href, label }: { href: string; label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let pastHero = false;
    let blocked = false;
    const update = () => setShow(pastHero && !blocked);
    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.8;
      update();
    };
    const targets = [document.querySelector("footer"), document.querySelector("#demo")].filter(Boolean) as Element[];
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      blocked = seen.size > 0;
      update();
    });
    targets.forEach((t) => io.observe(t));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 px-4 pt-3 transition-[transform,opacity] duration-300 ease-out lg:hidden",
        "pb-[max(12px,env(safe-area-inset-bottom))]",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <a
        href={href}
        tabIndex={show ? 0 : -1}
        aria-hidden={show ? undefined : true}
        className="btn-cta flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-ink-900 font-semibold text-paper-50 shadow-[0_12px_32px_-12px_rgba(29,31,35,0.6)]"
      >
        {label}
        <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
      </a>
    </div>
  );
}
