import { cn } from "@/lib/cn";
import { STATUS_LABEL, type Status } from "@/lib/dashboard/leads";

const TONE: Record<Status, string> = {
  new: "bg-accent-night text-ink-900",
  contacted: "bg-paper-300 text-ink-900",
  demo_scheduled: "bg-neon text-ink-900",
  won: "bg-success-night text-ink-900",
  lost: "text-paper-300 ring-1 ring-line-night",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-pill px-3 py-1 text-label whitespace-nowrap",
        TONE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
