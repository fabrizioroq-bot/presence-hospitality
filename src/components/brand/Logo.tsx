import { useId } from "react";
import { cn } from "@/lib/cn";

// TODO(brand): provisional recreation of the interlocking-loops mark from the pitch deck.
// Replace with the official vector if/when supplied.
export function LogoMark({
  className,
  gradient = false,
  title,
}: {
  className?: string;
  gradient?: boolean;
  title?: string;
}) {
  const id = useId();
  const stroke = gradient ? `url(#${id}-g)` : "currentColor";
  return (
    <svg
      viewBox="-12 -12 24 24"
      className={cn("h-6 w-6 shrink-0", className)}
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {gradient && (
        <defs>
          <linearGradient id={`${id}-g`} x1="-12" y1="-12" x2="12" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#9DC9FF" />
            <stop offset="1" stopColor="#E6F2FF" />
          </linearGradient>
        </defs>
      )}
      {[0, 90, 180, 270].map((r) => (
        <rect
          key={r}
          x={-3.4}
          y={-10.4}
          width={6.8}
          height={12.4}
          rx={3.4}
          transform={`rotate(${r + 45})`}
          stroke={stroke}
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

export function Logo({ className, onNight = false }: { className?: string; onNight?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark gradient={onNight} />
      <span className="text-[1.25rem] leading-none font-extrabold tracking-[-0.04em]">
        Presence Hospitality
      </span>
    </span>
  );
}
