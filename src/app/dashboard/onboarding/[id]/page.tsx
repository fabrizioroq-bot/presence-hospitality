import Link from "next/link";
import { notFound } from "next/navigation";
import { InviteActions } from "@/components/dashboard/onboarding/InviteActions";
import { InviteStatusBadge, ProgressMeter } from "@/components/dashboard/onboarding/InviteStatusBadge";
import { Shell } from "@/components/dashboard/Shell";
import { IntakeSummary } from "@/components/intake/IntakeSummary";
import { INTAKE_FORM } from "@/content/onboarding-form";
import { requireAdmin } from "@/lib/dashboard/auth";
import { DEFAULT_VALIDITY, VALIDITY, displayStatus, getInvite } from "@/lib/intake/admin";

export const metadata = { title: "Onboarding" };

const UUID = /^[0-9a-f-]{36}$/i;
const fmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Amsterdam" });
const when = (iso: string | null) => (iso ? fmt.format(new Date(iso)) : "—");
const link = "text-accent-night underline underline-offset-4";
const DONE: Record<string, string> = {
  extend: "Link extended.",
  revoke: "Link revoked. The client now sees a 'no longer active' page.",
  reopen: "Form reopened: the client can edit it again with the same link.",
};
const ghost = "inline-flex min-h-11 items-center rounded-pill px-5 text-body-sm font-semibold ring-1 ring-line-night hover:bg-night-800";

export default async function OnboardingDetailPage({ params, searchParams }: PageProps<"/dashboard/onboarding/[id]">) {
  const { id } = await params;
  const done = (await searchParams).done;
  const doneMessage = typeof done === "string" ? DONE[done] : undefined;
  if (!UUID.test(id)) notFound();
  const { supabase, user } = await requireAdmin();
  const { invite } = await getInvite(supabase, id);
  if (!invite) notFound();

  const status = displayStatus(invite);
  const response = invite.onboarding_responses;
  const rows: [string, React.ReactNode][] = [
    ["Contact", invite.contact_email ? <a key="e" href={`mailto:${invite.contact_email}`} className={link}>{invite.contact_email}</a> : "—"],
    ["Form language", invite.language === "nl" ? "Dutch" : "English"],
    ["Lead", invite.leads ? <Link key="l" href={`/dashboard/leads/${invite.leads.id}`} className={link}>{invite.leads.hotel_name}</Link> : "—"],
    ["Progress", <ProgressMeter key="p" value={response?.progress ?? 0} />],
    ["Created", when(invite.created_at)],
    ["Opened", when(invite.opened_at)],
    ["Last activity", when(invite.last_activity_at)],
    ["Submitted", when(invite.submitted_at)],
    ["Link expires", when(invite.expires_at)],
  ];

  return (
    <Shell email={user.email ?? ""} section="Onboarding">
      <Link href="/dashboard/onboarding" className="text-body-sm text-paper-300 underline-offset-4 hover:underline">
        ← All onboarding links
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-label text-paper-500">Onboarding{invite.is_test ? " · test link" : ""}</p>
          <h1 className="mt-3 text-display-lg">{invite.property_name}</h1>
        </div>
        <InviteStatusBadge status={status} />
      </div>
      {doneMessage && (
        <p role="status" className="mt-6 rounded-md border border-success-night/50 bg-success-night/10 p-3 text-body-sm">
          ✓ {doneMessage}
        </p>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <section aria-label="Details" className="rounded-xl border border-line-night/60 p-6 sm:p-8 lg:col-span-7">
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-[10rem_1fr]">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-label text-paper-500 sm:pt-1">{k}</dt>
                <dd className="text-body">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-2 border-t border-line-night/50 pt-6">
            <a href={`/dashboard/onboarding/${id}/export?format=csv`} className={ghost}>Export CSV</a>
            <a href={`/dashboard/onboarding/${id}/export?format=json`} className={ghost}>Export JSON</a>
            <Link href={`/dashboard/onboarding/${id}/print`} className={ghost}>Printable view / PDF</Link>
          </div>
        </section>
        <section aria-label="Manage" className="rounded-xl border border-line-night/60 bg-night-800 p-6 sm:p-8 lg:col-span-5">
          <h2 className="text-heading-sm font-extrabold">Manage link</h2>
          <div className="mt-5">
            <InviteActions id={id} status={status} validity={VALIDITY.map(({ value, label }) => ({ value, label }))} defaultValidity={DEFAULT_VALIDITY} />
          </div>
        </section>
      </div>

      <section aria-labelledby="answers" className="mt-12 flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="answers" className="text-heading-md">Answers</h2>
          <p className="text-body-sm text-paper-500">
            Shown in English{invite.language === "nl" ? " (the client sees the Dutch form)" : ""}. Unanswered questions are dimmed.
          </p>
        </div>
        {/* A light "document" panel: the summary uses the site's light tokens, like the client's view. */}
        <div data-mood="mist" className="rounded-xl bg-(--ph-bg-page) p-3 text-(--ph-text-primary) sm:p-6">
          <IntakeSummary doc={INTAKE_FORM.en} answers={response?.answers ?? {}} lang="en" notAnswered="Not answered" />
        </div>
      </section>
    </Shell>
  );
}
