"use client";

import { useId, useState } from "react";
import { cx as cn } from "@/lib/cx";

/**
 * Single-open accordion (WAI-ARIA disclosure pattern): real <button>s with aria-expanded /
 * aria-controls, answers in labelled regions. Height animates with the CSS grid-rows trick.
 */
export function Accordion({
  items,
  headingLevel: H = "h3",
}: {
  items: { id: string; q: string; a: string }[];
  headingLevel?: "h2" | "h3";
}) {
  const [open, setOpen] = useState<string | null>(null);
  const uid = useId();
  return (
    <ul className="border-t border-line-mist">
      {items.map((it) => {
        const isOpen = open === it.id;
        const btn = `${uid}-${it.id}-q`;
        const panel = `${uid}-${it.id}-a`;
        return (
          <li key={it.id} className="border-b border-line-mist">
            <H>
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? null : it.id)}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="text-heading-sm transition-colors group-hover:text-ink-700">{it.q}</span>
                <span
                  aria-hidden
                  className={cn(
                    "relative grid h-9 w-9 shrink-0 place-items-center rounded-pill ring-1 transition-[transform,background-color,color] duration-300",
                    isOpen ? "rotate-45 bg-ink-900 text-paper-50 ring-ink-900" : "text-ink-900 ring-line-mist group-hover:bg-mist-surface",
                  )}
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                </span>
              </button>
            </H>
            <div
              id={panel}
              role="region"
              aria-labelledby={btn}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <p className="max-w-[64ch] pb-6 text-body text-ink-700">{it.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
