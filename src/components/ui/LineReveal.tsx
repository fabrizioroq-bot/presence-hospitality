"use client";

import * as m from "motion/react-m";
import { splitHeadline } from "@/lib/headline";
import { ease } from "@/lib/motion";

/** Reveals each line with a clip-path wipe from the top, staggered 90 ms. Lines may contain one `<em>`. */
export function LineReveal({ lines, className, lineClassName }: { lines: string[]; className?: string; lineClassName?: string }) {
  return (
    <m.p
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
    >
      {lines.map((line, i) => (
        <m.span
          key={i}
          className={lineClassName ?? "block"}
          variants={{
            hidden: { clipPath: "inset(0 0 100% 0)", y: "0.3em" },
            show: { clipPath: "inset(0 0 0% 0)", y: 0, transition: { duration: 0.8, ease: ease.out } },
          }}
        >
          {splitHeadline(line).map((w, j, arr) => (
            <span key={j} className={w.glued ? "hyphens-manual" : undefined}>
              {w.parts.map((p, k) =>
                p.em ? (
                  <em key={k} className="emph">
                    {p.text}
                  </em>
                ) : (
                  <span key={k}>{p.text}</span>
                ),
              )}
              {j < arr.length - 1 ? " " : null}
            </span>
          ))}
        </m.span>
      ))}
    </m.p>
  );
}
