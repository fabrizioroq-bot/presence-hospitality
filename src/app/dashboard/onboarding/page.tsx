import Link from "next/link";
import { InviteStatusBadge, ProgressMeter } from "@/components/dashboard/onboarding/InviteStatusBadge";
import { Shell } from "@/components/dashboard/Shell";
import { requireAdmin } from "@/lib/dashboard/auth";
import { displayStatus, listInvites } from "@/lib/intake/admin";

export const metadata = { title: "Onboarding" };

const fmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Amsterdam",
});
const when = (iso: string | null) => (iso ? fmt.format(new Date(iso)) : "—");

export default async function OnboardingListPage({ searchParams }: PageProps<"/dashboard/onboarding">) {
  const { supabase, user } = await requireAdmin();
  const showTest = (await searchParams).test === "1";
  const { invites, error } = await listInvites(supabase, { showTest });

  return (
    <Shell email={user.email ?? ""} section="Onboarding">
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-label text-paper-500">Client intake</p>
            <h1 className="mt-3 text-display-lg">Onboarding</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={showTest ? "/dashboard/onboarding" : "/dashboard/onboarding?test=1"}
              aria-pressed={showTest}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill px-5 text-body-sm font-semibold ring-1 ring-line-night hover:bg-night-800 aria-pressed:bg-night-800"
            >
              <span aria-hidden className={showTest ? "text-accent-night" : "text-paper-500"}>
                {showTest ? "●" : "○"}
              </span>
              Show test links
            </Link>
            <Link
              href="/dashboard/onboarding/new"
              className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-paper-50 px-5 text-body-sm font-semibold text-ink-900 hover:bg-paper-300"
            >
              + New onboarding link
            </Link>
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-danger-night">
            Couldn&apos;t load the onboarding links. Please refresh.
          </p>
        ) : invites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-night/60 p-12 text-center text-paper-300">
            No onboarding links yet. Create one to send a client the intake form.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line-night/60">
            <table className="w-full min-w-[920px] text-left text-body-sm">
              <caption className="sr-only">Onboarding links, newest first</caption>
              <thead className="text-label text-paper-500">
                <tr className="border-b border-line-night/60">
                  {["Property", "Contact", "Lang", "Status", "Progress", "Expires", "Last activity"].map((h) => (
                    <th key={h} scope="col" className="px-5 py-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => (
                  <tr key={inv.id} className="group border-b border-line-night/30 last:border-0 hover:bg-night-800/70">
                    <td className="px-5 py-4 font-semibold">
                      <Link href={`/dashboard/onboarding/${inv.id}`} className="underline-offset-4 group-hover:underline">
                        {inv.property_name}
                      </Link>
                      {inv.is_test && <span className="ml-2 rounded-pill px-2 py-0.5 text-label text-paper-500 ring-1 ring-line-night">Test</span>}
                    </td>
                    <td className="px-5 py-4 text-paper-300">{inv.contact_email ?? "—"}</td>
                    <td className="px-5 py-4 text-label text-paper-300">{inv.language}</td>
                    <td className="px-5 py-4">
                      <InviteStatusBadge status={displayStatus(inv)} />
                    </td>
                    <td className="px-5 py-4">
                      <ProgressMeter value={inv.onboarding_responses?.progress ?? 0} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-paper-300 tabular-nums">{when(inv.expires_at)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-paper-300 tabular-nums">{when(inv.last_activity_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
