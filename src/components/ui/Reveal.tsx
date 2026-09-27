import type { CSSProperties, ReactNode } from "react";

/*
 * Scroll reveals without a JS animation library: server-rendered markup + CSS transitions,
 * triggered by <RevealObserver> (one IntersectionObserver for the whole page).
 *   data-rv-trigger   element that starts its reveals when `data-rv-amount` of it is visible
 *   data-rv-load      start on load instead of on view (above the fold)
 *   data-rv="fade|soft|word|line"   item style (see globals.css); stagger via --rv-i/--rv-step/--rv-delay
 * Without JS, or with reduced motion, everything renders in its final state.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export function Reveal({
  children,
  className,
  as: Comp = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "p" | "section";
}) {
  return (
    <Comp className={className} data-rv-trigger="" data-rv="fade">
      {children}
    </Comp>
  );
}

/**
 * `onLoad` animates on mount instead of on view: use it above the fold, together with
 * `soft` items, so the content is painted from the first frame (LCP-safe).
 */
export function RevealGroup({
  children,
  className,
  gap = 0.07,
  onLoad = false,
  delay = 0,
  id,
  tabIndex,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  onLoad?: boolean;
  delay?: number;
  id?: string;
  /** Set to 0 when the group is a mobile swipe row (keyboard access to the scroller). */
  tabIndex?: number;
}) {
  const style: Vars = { "--rv-step": `${gap}s`, "--rv-delay": `${delay}s` };
  return (
    <div id={id} tabIndex={tabIndex} className={className} style={style} data-rv-trigger="" data-rv-load={onLoad ? "" : undefined}>
      {children}
    </div>
  );
}

export function RevealItem({
  children,
  className,
  soft = false,
}: {
  children: ReactNode;
  className?: string;
  /** No opacity change: rise + unblur only (LCP-safe). */
  soft?: boolean;
}) {
  return (
    <div className={className} data-rv={soft ? "soft" : "fade"}>
      {children}
    </div>
  );
}
