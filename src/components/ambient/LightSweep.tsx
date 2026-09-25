import { cn } from "@/lib/cn";

/** A very slow diagonal band of light for night sections (CSS only). */
export function LightSweep({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-[6] overflow-hidden", className)}>
      <div className="light-sweep" />
    </div>
  );
}
