import { cn } from "@/lib/cn";

// Faint hexagon outlines, echoing the bottom-left motif on the pitch slides.
export function HexMotif({ className }: { className?: string }) {
  const hex = (cx: number, cy: number, r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
  return (
    <svg
      aria-hidden
      viewBox="0 0 420 420"
      className={cn("pointer-events-none absolute", className)}
      fill="none"
      stroke="var(--ink-900)"
      strokeOpacity={0.06}
      strokeWidth={1}
    >
      <polygon points={hex(150, 250, 150)} />
      <polygon points={hex(150, 250, 95)} />
      <circle cx={150} cy={250} r={70} />
    </svg>
  );
}
