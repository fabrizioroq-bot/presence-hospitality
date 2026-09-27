"use client";

import { useEffect, useState } from "react";
import { cx as cn } from "@/lib/cx";

/** Page dots for a mobile `.swipe-row` (by id). Tapping a dot scrolls to that card. Hidden on lg. */
export function SwipeDots({ target, count, label }: { target: string; count: number; label: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const items = Array.from(el.children) as HTMLElement[];
        const x = el.scrollLeft + 16;
        let best = 0;
        items.forEach((it, k) => {
          if (Math.abs(it.offsetLeft - x) < Math.abs(items[best].offsetLeft - x)) best = k;
        });
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) best = items.length - 1;
        setI(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [target]);
  const go = (k: number) => {
    const el = document.getElementById(target);
    const item = el?.children[k] as HTMLElement | undefined;
    if (el && item) el.scrollTo({ left: item.offsetLeft - 16, behavior: "smooth" });
  };
  return (
    <div className="mt-4 flex items-center justify-center gap-1 lg:hidden">
      {Array.from({ length: count }, (_, k) => (
        <button key={k} type="button" onClick={() => go(k)} aria-label={`${label} ${k + 1}/${count}`} aria-current={k === i ? "true" : undefined} className="grid h-8 w-6 place-items-center">
          <span className={cn("accent-dot block h-1.5 rounded-full transition-all duration-300", k === i ? "w-5 bg-current" : "w-1.5 bg-current opacity-30")} />
        </button>
      ))}
    </div>
  );
}
