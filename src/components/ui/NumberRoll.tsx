"use client";

import { useInView, useReducedMotion } from "@/lib/hooks";
import { useEffect, useRef, useState } from "react";

/** Two-digit counter that rolls from 00 to `value` (≈400 ms) the first time it's seen. */
export function NumberRoll({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, 0.8);
  const reduce = useReducedMotion();
  const [n, setN] = useState(value);
  useEffect(() => {
    if (!seen || reduce) return;
    let i = 0;
    const id = setInterval(() => {
      setN(i);
      if (i++ >= value) clearInterval(id);
    }, 400 / Math.max(value, 1));
    return () => clearInterval(id);
  }, [seen, reduce, value]);
  return (
    <span ref={ref} className={className}>
      <span aria-hidden>{String(n).padStart(2, "0")}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
