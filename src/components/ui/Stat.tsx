import type { ReactNode } from "react";
import { cx as cn } from "@/lib/cx";

const VALUE_SIZE = {
  md: "text-[clamp(2rem,1.6rem+1.6vw,3rem)]",
  lg: "text-display-lg",
  xl: "text-display-xl",
} as const;

/**
 * Stat block: a key figure, its label and an optional footnote marker. Figures come from
 * src/content/claims.ts and render only when the claim is enabled; pair a marker with <Footnote>.
 */
export function Stat({
  value,
  label,
  mark,
  size = "lg",
  className,
}: {
  value: ReactNode;
  label: ReactNode;
  /** Footnote marker ("*", "¹"); the <Footnote> with the same marker must be on screen. */
  mark?: string;
  size?: keyof typeof VALUE_SIZE;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className={cn("ui-stat-value key-figure", VALUE_SIZE[size])}>
        {value}
        {mark && (
          <sup aria-hidden className="ui-stat-mark">
            {mark}
          </sup>
        )}
      </span>
      <span className="max-w-[24ch] text-body text-ui-ink-2">{label}</span>
    </div>
  );
}

/** Footnote: the qualifier for a marked figure ("* Estimate based on…"). */
export function Footnote({
  mark,
  className,
  children,
}: {
  mark?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p className={cn("ui-footnote", className)}>
      {mark && <span aria-hidden>{mark} </span>}
      {children}
    </p>
  );
}
