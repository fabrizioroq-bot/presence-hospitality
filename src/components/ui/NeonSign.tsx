"use client";

import * as m from "motion/react-m";

/** The vertical "HOTEL" neon from the pitch photo, drawn in code. Flickers once when it comes into view. */
export function NeonSign({ word = "HOTEL" }: { word?: string }) {
  return (
    <m.div
      aria-hidden
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0.25 }}
      whileInView={{ opacity: [0.25, 1, 0.55, 1, 0.8, 1] }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.9, times: [0, 0.15, 0.3, 0.5, 0.65, 1] }}
    >
      {word.split("").map((c, i) => (
        <span
          key={i}
          className="grid h-14 w-12 place-items-center rounded-sm border border-amber-300/70 text-[1.75rem] font-extrabold text-amber-300"
          style={{ textShadow: "0 0 8px rgba(245,169,74,0.9), 0 0 24px rgba(245,169,74,0.5)", boxShadow: "0 0 14px rgba(245,169,74,0.35), inset 0 0 10px rgba(245,169,74,0.25)" }}
        >
          {c}
        </span>
      ))}
    </m.div>
  );
}
