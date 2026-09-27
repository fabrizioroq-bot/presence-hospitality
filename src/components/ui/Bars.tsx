import type { CSSProperties } from "react";

/** Three outlined bars that fill on view — the inputs of the monthly fee (rooms, hours, volume). CSS reveal (see Reveal.tsx). */
export function Bars({ items }: { items: { label: string; value: number }[] }) {
  return (
    <ul className="flex flex-col gap-3" data-rv-trigger="" data-rv-amount="0.6" style={{ "--rv-step": "0.12s" } as CSSProperties}>
      {items.map((it) => (
        <li key={it.label} className="grid grid-cols-[7.5rem_1fr] items-center gap-4">
          <span className="text-label text-ink-700">{it.label}</span>
          <span className="relative h-3 overflow-hidden rounded-pill ring-1 ring-line-mist">
            <span data-rv="bar" className="absolute inset-y-0 left-0 origin-left rounded-pill bg-ink-900" style={{ width: `${it.value * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
