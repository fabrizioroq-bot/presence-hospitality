import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { PrintButton } from "@/components/dashboard/onboarding/PrintButton";
import { IntakeSummary } from "@/components/intake/IntakeSummary";
import { INTAKE_FORM } from "@/content/onboarding-form";
import { requireAdmin } from "@/lib/dashboard/auth";
import { STATUS_LABEL, displayStatus, getInvite } from "@/lib/intake/admin";
import "@/styles/print.css";

export const metadata = { title: "Onboarding (print)" };

const UUID = /^[0-9a-f-]{36}$/i;
const fmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Amsterdam" });

/** The answers as a light document, ready for the browser's "Save as PDF". */
export default async function OnboardingPrintPage({ params }: PageProps<"/dashboard/onboarding/[id]/print">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { invite } = await getInvite(supabase, id);
  if (!invite) notFound();
  const response = invite.onboarding_responses;
  const meta = [
    STATUS_LABEL[displayStatus(invite)],
    `${response?.progress ?? 0}% complete`,
    invite.submitted_at ? `submitted ${fmt.format(new Date(invite.submitted_at))}` : null,
    invite.contact_email,
  ].filter(Boolean);

  return (
    <div data-mood="mist" className="min-h-svh bg-(--ph-bg-page) text-(--ph-text-primary)">
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-8">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <Link href={`/dashboard/onboarding/${id}`} className="text-body-sm text-(--ph-text-secondary) underline-offset-4 hover:underline">
            ← Back to the dashboard
          </Link>
          <PrintButton className="inline-flex min-h-11 items-center rounded-pill bg-(--ph-brand-primary) px-5 text-body-sm font-semibold text-(--ph-text-on-dark)" />
        </div>
        <header className="flex flex-col gap-3">
          <Logo on="light" className="h-6" />
          <p className="mt-4 text-label text-(--ph-text-muted)">{INTAKE_FORM.en.title}</p>
          <h1 className="text-display-lg text-(--ph-brand-primary)">{invite.property_name}</h1>
          <p className="text-body-sm text-(--ph-text-secondary)">{meta.join(" · ")}</p>
        </header>
        <IntakeSummary doc={INTAKE_FORM.en} answers={response?.answers ?? {}} lang="en" notAnswered="Not answered" />
      </main>
    </div>
  );
}
