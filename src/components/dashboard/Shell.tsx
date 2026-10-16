import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/dashboard/actions";
import { Logo, LogoMark } from "@/components/brand/Logo";

const NAV = [
  { href: "/dashboard", label: "Leads" },
  { href: "/dashboard/onboarding", label: "Onboarding" },
] as const;

/** Dashboard chrome: header with brand, sections, signed-in user and sign out. */
export function Shell({
  email,
  section = "Leads",
  children,
}: {
  email: string;
  /** Current section: highlights its nav link ("Leads", "Onboarding"); other pages pass their own name. */
  section?: string;
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
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/dashboard" aria-label="Dashboard home" className="flex items-center gap-3">
              {/* Below the lockup's minimum width budget (phones), the mark alone. */}
              <LogoMark on="dark" className="h-6 w-6 sm:hidden" />
              <Logo on="dark" decorative className="hidden h-6 sm:block" />
            </Link>
            <nav aria-label="Dashboard" className="flex gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={section === n.label ? "page" : undefined}
                  className="inline-flex min-h-10 items-center rounded-pill px-3 text-body-sm font-semibold text-paper-300 hover:text-paper-50 aria-[current=page]:bg-night-800 aria-[current=page]:text-paper-50"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
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
