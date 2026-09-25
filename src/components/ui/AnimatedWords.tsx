"use client";

import * as m from "motion/react-m";
import type { HeadlineWord } from "@/lib/headline";
import { ease } from "@/lib/motion";

type Tag = "h1" | "h2" | "h3" | "p";

/**
 * Word-by-word rise + unblur (adapted from React Bits "Blur Text", Motion only).
 * Opacity stays at 1 so the text is painted immediately — safe for LCP.
 * `trigger="load"` animates on mount (hero); default animates on first view.
 */
export function AnimatedWords({
  words,
  as = "h2",
  className,
  id,
  trigger = "view",
  delay = 0,
  step = 0.07,
}: {
  words: HeadlineWord[];
  as?: Tag;
  className?: string;
  id?: string;
  trigger?: "load" | "view";
  delay?: number;
  step?: number;
}) {
  const Comp = m[as];
  const variants = {
    hidden: { y: "0.28em", filter: "blur(8px)" },
    show: (i: number) => ({
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: ease.out, delay: delay + i * step },
    }),
  };
  const trig =
    trigger === "load"
      ? { initial: "hidden", animate: "show" }
      : { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.5 } };

  return (
    <Comp id={id} className={className} {...trig}>
      {words.map((w, i) => (
        <span key={i}>
          <m.span custom={i} variants={variants} className={w.glued ? "inline-block hyphens-manual will-change-transform" : "inline-block whitespace-nowrap will-change-transform"}>
            {w.parts.map((p, j) =>
              p.em ? (
                <em key={j} className="emph">
                  {p.text}
                </em>
              ) : (
                <span key={j}>{p.text}</span>
              ),
            )}
          </m.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Comp>
  );
}
