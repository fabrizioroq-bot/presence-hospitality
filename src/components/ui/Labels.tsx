import type { ReactNode } from "react";
import { cx as cn } from "@/lib/cx";

/* Small inline labels from the UI kit (kit.css): gradient pill, chip/tag, numbered circle. */

const PILL_SIZE = {
  sm: "px-3 py-1.5 text-[0.9375rem]",
  md: "px-5 py-2.5 text-[1.125rem]",
  lg: "px-6 py-3 text-heading-md",
} as const;

/** Gradient pill label: package names, step names. Dark ink on the light gradient, always. */
export function Pill({
  size = "md",
  className,
  children,
}: {
  size?: keyof typeof PILL_SIZE;
  className?: string;
  children: ReactNode;
}) {
  return <span className={cn("ui-pill", PILL_SIZE[size], className)}>{children}</span>;
}

/** Chip / tag for short facts. `dot`: "accent" (brand dot) or "live" (pulsing status, live services only). */
export function Chip({
  dot,
  className,
  children,
}: {
  dot?: "accent" | "live";
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn("ui-chip", className)}>
      {dot === "accent" && <span aria-hidden className="ui-dot" />}
      {dot === "live" && <span aria-hidden className="live-dot" />}
      {children}
    </span>
  );
}

const NUM_SIZE = {
  sm: "h-9 w-9 text-[0.9375rem]",
  md: "h-12 w-12 text-[1.25rem]",
  lg: "h-16 w-16 text-[1.75rem]",
} as const;

/** Numbered circle ("01"). Decorative by default: the step's heading carries the meaning. */
export function NumberBadge({
  n,
  size = "md",
  isLit = false,
  label,
  className,
}: {
  n: number;
  size?: keyof typeof NUM_SIZE;
  /** Active / completed step. */
  isLit?: boolean;
  /** Accessible text when the number is the only label (e.g. "Step 1"). */
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("ui-num", NUM_SIZE[size], className)}
      data-lit={isLit || undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}
