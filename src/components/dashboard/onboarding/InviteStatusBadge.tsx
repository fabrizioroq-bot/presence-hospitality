import { cn } from "@/lib/cn";
import { STATUS_LABEL, type InviteStatus } from "@/lib/intake/admin";

const TONE: Record<InviteStatus, string> = {
  sent: "text-paper-300 ring-1 ring-line-night",
  opened: "bg-paper-300 text-ink-900",
  in_progress: "bg-accent-night text-ink-900",
  submitted: "bg-success-night text-ink-900",
  expired: "bg-neon text-ink-900",
  revoked: "text-paper-500 ring-1 ring-line-night line-through",
};

export function InviteStatusBadge({ status }: { status: InviteStatus }) {
  return <span className={cn("inline-flex rounded-pill px-3 py-1 text-label whitespace-nowrap", TONE[status])}>{STATUS_LABEL[status]}</span>;
}

/** Thin progress bar with the percentage (transform only). */
export function ProgressMeter({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-3">
      <span aria-hidden className="h-1.5 w-20 overflow-hidden rounded-pill bg-line-night/40">
        <span className="block h-full origin-left bg-accent-night" style={{ transform: `scaleX(${value / 100})` }} />
      </span>
      <span className="tabular-nums">{value}%</span>
    </span>
  );
}
