import { cn } from "@/lib/cn";

/** 80px (240px desktop) gradient band between a mist and a night section, so the page never has a hard cut. */
type Mood = "mist" | "night" | "deep";

export function MoodTransition({ from, to, className }: { from: Mood; to: Mood; className?: string }) {
  const c = { mist: "var(--mist-bg)", night: "var(--charcoal-700)", deep: "var(--night-900)" };
  return (
    <div
      aria-hidden
      className={cn("relative h-14 overflow-hidden sm:h-20 lg:h-60", className)}
      style={{ background: `linear-gradient(180deg, ${c[from]} 0%, ${c[to]} 100%)` }}
    >
      <span
        className="orb"
        style={{
          width: "min(50vw, 640px)",
          height: "min(50vw, 640px)",
          left: "55%",
          top: "-60%",
          opacity: 0.35,
          background: "radial-gradient(circle, var(--orb-sky) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}
