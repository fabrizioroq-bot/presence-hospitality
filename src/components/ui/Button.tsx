import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

type Variant = "primary" | "glow" | "ghost";
type Mood = "mist" | "night";

const base =
  "group inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-6 py-3 text-[0.9375rem] font-semibold tracking-[-0.01em] transition-[background-color,color,border-color,box-shadow] duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const styles: Record<Mood, Record<Variant, string>> = {
  mist: {
    primary: "bg-ink-900 text-paper-50 hover:bg-[#2a2d33]",
    glow: "bg-holo-gradient text-ink-900 ring-1 ring-ink-900/15 hover:shadow-soft",
    ghost: "text-ink-900 ring-1 ring-line-mist hover:bg-mist-surface",
  },
  night: {
    primary: "bg-paper-50 text-ink-900 hover:bg-holo-100",
    glow: "bg-holo-gradient text-ink-900 hover:shadow-glow-holo",
    ghost: "text-paper-50 ring-1 ring-line-night hover:bg-night-800",
  },
};

export function buttonClass({
  variant = "primary",
  mood = "mist",
  className,
}: {
  variant?: Variant;
  mood?: Mood;
  className?: string;
}) {
  return cn(base, styles[mood][variant], className);
}

export function Arrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function ButtonLink({
  variant,
  mood,
  className,
  children,
  arrow = false,
  ...props
}: ComponentProps<"a"> & { variant?: Variant; mood?: Mood; arrow?: boolean }) {
  return (
    <a className={buttonClass({ variant, mood, className })} {...props}>
      {children}
      {arrow && <Arrow />}
    </a>
  );
}

export function Button({
  variant,
  mood,
  className,
  children,
  arrow = false,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; mood?: Mood; arrow?: boolean }) {
  return (
    <button className={buttonClass({ variant, mood, className })} {...props}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
