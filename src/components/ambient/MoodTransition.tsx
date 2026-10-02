import { cn } from "@/lib/cn";

/** 80px (240px desktop) gradient band between a mist and a night section, so the page never has a hard cut. */
type Mood = "mist" | "night" | "deep";
/** Light-section tone (globals.css "Section tones"). */
export type Tone = "ivory" | "lavender";

export function MoodTransition({
  from,
  to,
  tone,
  className,
}: {
  from: Mood;
  to: Mood;
  /** Tone of the light section on the other side, so the band blends into it. */
  tone?: Tone;
  className?: string;
}) {
  const c = { mist: "var(--mist-bg)", night: "var(--charcoal-700)", deep: "var(--night-900)" };
  return (
    <div
      aria-hidden
      data-tone={tone}
      data-band
      className={cn("relative h-14 overflow-hidden sm:h-20 lg:h-60", className)}
      // Through petrol-tinted mid tones: a straight ivory → dark fade passes through flat grey.
      style={{
        background: `linear-gradient(180deg, ${c[from]} 0%, color-mix(in oklab, ${c[from]} 68%, #173b4d) 38%, color-mix(in oklab, #173b4d 62%, ${c[to]}) 72%, ${c[to]} 100%)`,
      }}
    >
      <span
        className="orb"
        style={{
          width: "min(50vw, 640px)",
          height: "min(50vw, 640px)",
          left: "55%",
          top: "-60%",
          opacity: 0.35,
          background: "radial-gradient(circle, var(--ph-brand-secondary) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}
