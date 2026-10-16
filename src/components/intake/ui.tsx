import type { ComponentProps } from "react";

/*
 * Intake-only copies of two tiny shared helpers (cx, the kit Button). Importing the site's client
 * modules from the intake made Turbopack regroup the chunks they share with the demo form, and
 * /en/demo and /en/onboarding grew by 1 KB (measured 16-10). Keep the intake's client graph separate
 * from the public site's; the look comes from the same global classes (.btn-cta, tokens).
 */

export const join = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

const BASE =
  "group inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-6 py-3 text-[1rem] font-semibold tracking-[-0.01em] transition-[background-color,color,border-color,box-shadow] duration-200 disabled:cursor-not-allowed disabled:opacity-60";
const VARIANT = {
  primary: "btn-cta",
  ghost: "text-(--ph-text-primary) ring-1 ring-(--ph-border-ui) hover:bg-(--ph-bg-surface)",
} as const;

export function IntakeButton({
  variant = "primary",
  arrow = false,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof VARIANT; arrow?: boolean }) {
  return (
    <button type="button" className={join(BASE, VARIANT[variant], className)} {...props}>
      {children}
      {arrow && (
        <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      )}
    </button>
  );
}
