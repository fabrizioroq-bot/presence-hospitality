"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

/**
 * Rotating word (adapted from Magic UI "Word Rotate"). All words are stacked in one grid cell
 * so the width never changes (no layout shift); screen readers get the full list once.
 * Each new word rises in (CSS keyframes `word-in`).
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
        <span key={words[i]} className={i === 0 ? "col-start-1 row-start-1 whitespace-nowrap" : "word-in col-start-1 row-start-1 whitespace-nowrap"}>
          <em className="emph">{words[i]}</em>
        </span>
      </span>
    </span>
  );
}
