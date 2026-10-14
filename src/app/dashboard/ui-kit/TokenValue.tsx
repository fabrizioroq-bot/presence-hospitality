"use client";

/**
 * Prints the live computed value of a CSS custom property where it is rendered, so the reference
 * never drifts from globals.css / kit.css (the old styleguide hard-coded hex values and went stale).
 */
export function TokenValue({ name, className }: { name: `--${string}`; className?: string }) {
  return (
    <span
      className={className ?? "font-mono text-[0.8125rem] break-all text-ui-muted"}
      ref={(el) => {
        if (el) el.textContent = getComputedStyle(el).getPropertyValue(name).trim() || "(unset)";
      }}
    />
  );
}
