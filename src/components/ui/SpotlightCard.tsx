"use client";

import type { ReactNode } from "react";
import { cx as cn } from "@/lib/cx";

/** Soft light that follows the pointer inside the card (adapted from Magic UI "Magic Card", no deps). */
export function SpotlightCard({ children, className, tone = "holo" }: { children: ReactNode; className?: string; tone?: "holo" | "ink" }) {
  return (
    <div
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={cn("group/spot relative isolate overflow-hidden", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background:
            tone === "holo"
              ? "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.08), transparent 70%)"
              : "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.45), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
