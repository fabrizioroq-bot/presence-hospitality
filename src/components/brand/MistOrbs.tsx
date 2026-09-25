import { cn } from "@/lib/cn";

type OrbColor = "sky" | "mint" | "lavender" | "peach";

export type Orb = {
  color: OrbColor;
  /** CSS size, e.g. "60vw" */
  size: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  opacity?: number;
  /** drift duration in seconds (18–26) */
  dur?: number;
  dx?: string;
  dy?: string;
};

const colorVar: Record<OrbColor, string> = {
  sky: "var(--orb-sky)",
  mint: "var(--orb-mint)",
  lavender: "var(--orb-lavender)",
  peach: "var(--orb-peach)",
};

export function MistOrbs({ orbs, className }: { orbs: Orb[]; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {orbs.map((o, i) => (
        <span
          key={i}
          className="orb"
          style={
            {
              width: o.size,
              height: o.size,
              top: o.top,
              left: o.left,
              right: o.right,
              bottom: o.bottom,
              opacity: o.opacity ?? 0.7,
              background: `radial-gradient(circle at 50% 50%, ${colorVar[o.color]} 0%, ${colorVar[o.color]} 35%, transparent 70%)`,
              "--dur": `${o.dur ?? 22}s`,
              "--dx": o.dx ?? "4%",
              "--dy": o.dy ?? "-3%",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
