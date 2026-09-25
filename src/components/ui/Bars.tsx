"use client";

import * as m from "motion/react-m";
import { ease } from "@/lib/motion";

/** Three outlined bars that fill on view — the inputs of the monthly fee (rooms, hours, volume). */
export function Bars({ items }: { items: { label: string; value: number }[] }) {
  return (
    <m.ul
      className="flex flex-col gap-3"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
    >
      {items.map((it) => (
        <li key={it.label} className="grid grid-cols-[7.5rem_1fr] items-center gap-4">
          <span className="text-label text-ink-700">{it.label}</span>
          <span className="relative h-3 overflow-hidden rounded-pill ring-1 ring-line-mist">
            <m.span
              className="absolute inset-y-0 left-0 origin-left rounded-pill bg-ink-900"
              style={{ width: `${it.value * 100}%` }}
              variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.9, ease: ease.out } } }}
            />
          </span>
        </li>
      ))}
    </m.ul>
  );
}
