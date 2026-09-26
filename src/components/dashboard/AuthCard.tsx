import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";

/** Centered card used by login / forgot / set-password. */
export function AuthCard({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative isolate grid min-h-svh place-items-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 0%, rgba(141,179,223,0.18), transparent 70%), radial-gradient(40% 40% at 10% 100%, rgba(241,199,163,0.1), transparent 70%)",
        }}
      />
      <div className="w-full max-w-md">
        <Logo onNight className="mb-10" />
        <div className="rounded-xl border border-line-night bg-night-800 p-8 sm:p-10">
          <p className="text-label text-paper-500">Leads dashboard</p>
          <h1 className="mt-4 text-display-lg">{title}</h1>
          {lead && <p className="mt-3 text-body text-paper-300">{lead}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
