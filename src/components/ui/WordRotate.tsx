"use client";

import { AnimatePresence, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useState } from "react";
import { ease } from "@/lib/motion";

/**
 * Rotating word (adapted from Magic UI "Word Rotate"). All words are stacked in one grid cell
 * so the width never changes (no layout shift); screen readers get the full list once.
 */
export function WordRotate({ words, sr, className, interval = 2600 }: { words: string[]; sr: string; className?: string; interval?: number }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [reduce, words.length, interval]);
  return (
    <span className={className}>
      <span className="sr-only">{sr}</span>
      <span aria-hidden className="inline-grid">
        {words.map((w) => (
          <span key={w} className="invisible col-start-1 row-start-1 whitespace-nowrap">
            {w}
          </span>
        ))}
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={words[i]}
            className="col-start-1 row-start-1 whitespace-nowrap"
            initial={{ y: "0.4em", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-0.4em", opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: ease.out }}
          >
            <em className="emph">{words[i]}</em>
          </m.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
