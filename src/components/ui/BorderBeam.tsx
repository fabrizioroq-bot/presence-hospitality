import type { CSSProperties } from "react";

// Adapted from Magic UI "Border Beam": a light travelling along the border (CSS offset-path
// animation, no JS), token colours, hidden for reduced-motion users via CSS.
export function BorderBeam({
  size = 120,
  duration = 8,
  delay = 0,
  colorFrom = "var(--holo-300)",
  colorTo = "var(--amber-400)",
  borderWidth = 1.5,
}: {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] motion-reduce:hidden border-(length:--beam-w) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box]"
      style={{ "--beam-w": `${borderWidth}px` } as CSSProperties}
    >
      <div
        className="border-beam absolute aspect-square bg-linear-to-l from-(--beam-from) via-(--beam-to) to-transparent"
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            animationDuration: `${duration}s`,
            animationDelay: `${-delay}s`,
            "--beam-from": colorFrom,
            "--beam-to": colorTo,
          } as CSSProperties
        }
      />
    </div>
  );
}
