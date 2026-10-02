import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/dashboard/actions";
import { Logo } from "@/components/brand/Logo";

/** Dashboard chrome: header with brand, signed-in user and sign out. */
export function Shell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  return (
    <div className="relative isolate min-h-svh">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 80% 0%, rgba(95,127,119,0.14), transparent 70%)",
        }}
      />
      <header className="sticky top-0 z-40 border-b border-line-night/40 bg-night-900/80 backdrop-blur-[14px]">
        <div className="container-site flex h-16 items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo onNight />
            <span className="hidden text-label text-paper-500 sm:inline">
              / Leads
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-body-sm text-paper-300 md:inline">
              {email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="min-h-10 rounded-pill px-4 text-body-sm font-semibold text-paper-50 ring-1 ring-line-night hover:bg-night-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="container-site py-10 lg:py-14">{children}</main>
    </div>
  );
}
