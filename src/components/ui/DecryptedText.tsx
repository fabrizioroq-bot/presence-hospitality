"use client";

import { useReducedMotion } from "@/lib/hooks";
import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#·";

/**
 * Sequential decrypt on first view — adapted from React Bits "Decrypted Text",
 * trimmed to the single mode we use. Screen readers always get the final text.
 */
export function DecryptedText({
  text,
  speed = 38,
  delay = 0,
  className,
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduce || !ref.current) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const scramble = (revealed: number) =>
      text
        .split("")
        .map((c, i) => (c === " " || i < revealed ? c : CHARS[Math.floor(Math.random() * CHARS.length)]))
        .join("");

    // Text that is already on screen when the page loads stays as it is (a scramble at load reads
    // as half-loaded); the decrypt plays when the text scrolls into view later.
    let first = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        const wasFirst = first;
        first = false;
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (wasFirst) return;
        setShown(scramble(0));
        timeout = setTimeout(() => {
          let revealed = 0;
          interval = setInterval(() => {
            revealed++;
            setShown(scramble(revealed));
            if (revealed >= text.length) clearInterval(interval);
          }, speed);
        }, delay);
      },
      { threshold: 0.1 },
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [text, speed, delay, reduce]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{shown}</span>
    </span>
  );
}
