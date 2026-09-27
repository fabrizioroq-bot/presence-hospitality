"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { cx as cn } from "@/lib/cx";

// Per-element reveal timing (CSS reveal, see Reveal.tsx).
const at = (delay: number) => ({ "--rv-i": 0, "--rv-delay": `${delay}s` }) as CSSProperties;

export type PackageItem = { name: string; points: string[] };

/**
 * Pitch slide 8: four pills on a dashed line above one outlined panel with four columns
 * (desktop; hovering a column lights its pill). Mobile: accessible tabs.
 */
export function PackagesBoard({ items, tabsLabel }: { items: PackageItem[]; tabsLabel: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const [tab, setTab] = useState(0);
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next = e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (tab + dir + items.length) % items.length;
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  const bullet = (p: string, active: boolean) => (
    <li key={p} className="flex gap-3">
      <span aria-hidden className={cn("mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full transition-colors", active ? "bg-holo-300" : "bg-line-night")} />
      <span>{p}</span>
    </li>
  );

  return (
    <>
      {/* ---------- Desktop board ---------- */}
      <div className="hidden lg:block" data-rv-trigger="">
        <div className="relative grid grid-cols-4 gap-6">
          {/* Dashed connector, wiped in left → right (clip-path, since the dashes use stroke-dasharray). */}
          <div
            aria-hidden
            data-rv="wipe"
            className="pointer-events-none absolute top-1/2 right-[-48px] left-0 h-px -translate-y-1/2"
            style={{ ...at(0), backgroundImage: "repeating-linear-gradient(90deg, var(--paper-300) 0 6px, transparent 6px 12px)" }}
          />
          {items.map((it, i) => (
            <span
              key={it.name}
              data-rv="pop"
              style={at(0.25 + i * 0.12)}
              className={cn(
                "relative z-10 justify-self-start rounded-pill bg-holo-gradient px-6 py-3 text-heading-md text-ink-900 transition-shadow duration-300",
                hover === i && "shadow-glow-holo",
              )}
            >
              {it.name}
            </span>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-4 rounded-xl border border-line-night">
          {items.map((it, i) => (
            <div
              key={it.name}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              data-rv="rise"
              style={at(0.7 + i * 0.1)}
              className={cn("relative px-8 py-10", i > 0 && "before:absolute before:inset-y-8 before:left-0 before:w-px before:bg-line-night")}
            >
              <h3 className="sr-only">{it.name}</h3>
              <ul className={cn("flex flex-col gap-4 text-body transition-colors duration-300", hover === i ? "text-paper-50" : "text-paper-300")}>
                {it.points.map((p) => bullet(p, hover === i))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Mobile tabs ---------- */}
      <div className="lg:hidden">
        <div role="tablist" aria-label={tabsLabel} className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2" onKeyDown={onKey}>
          {items.map((it, i) => (
            <button
              key={it.name}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={tab === i}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={tab === i ? 0 : -1}
              onClick={() => setTab(i)}
              className={cn(
                "min-h-11 shrink-0 snap-start rounded-pill px-5 py-2.5 text-heading-sm font-extrabold whitespace-nowrap transition-colors",
                tab === i ? "bg-holo-gradient text-ink-900" : "text-paper-300 ring-1 ring-line-night",
              )}
            >
              {it.name}
            </button>
          ))}
        </div>
        {items.map((it, i) => (
          <div
            key={it.name}
            role="tabpanel"
            id={`${id}-panel-${i}`}
            aria-labelledby={`${id}-tab-${i}`}
            hidden={tab !== i}
            className="mt-6 rounded-xl border border-line-night p-6"
          >
            <ul className="flex flex-col gap-4 text-body text-paper-50">{it.points.map((p) => bullet(p, true))}</ul>
          </div>
        ))}
      </div>
    </>
  );
}
