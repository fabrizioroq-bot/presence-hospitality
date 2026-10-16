import Link from "next/link";
import { NewInviteForm, type LeadOption } from "@/components/dashboard/onboarding/NewInviteForm";
import { Shell } from "@/components/dashboard/Shell";
import { requireAdmin } from "@/lib/dashboard/auth";
import { DEFAULT_VALIDITY, VALIDITY } from "@/lib/intake/admin";

export const metadata = { title: "New onboarding link" };

const LEADS_LIMIT = 200;

type LeadRow = { id: string; hotel_name: string; first_name: string; last_name: string; email: string; language: "en" | "nl" };

export default async function NewOnboardingPage({ searchParams }: PageProps<"/dashboard/onboarding/new">) {
  const { supabase, user } = await requireAdmin();
  const lead = (await searchParams).lead;
  const { data } = await supabase
    .from("leads")
    .select("id,hotel_name,first_name,last_name,email,language")
    .order("created_at", { ascending: false })
    .limit(LEADS_LIMIT)
    .returns<LeadRow[]>();
  const leads: LeadOption[] = (data ?? []).map((l) => ({
    id: l.id,
    hotel: l.hotel_name,
    contact: `${l.first_name} ${l.last_name}`,
    email: l.email,
    language: l.language,
  }));

  return (
    <Shell email={user.email ?? ""} section="Onboarding">
      <Link href="/dashboard/onboarding" className="text-body-sm text-paper-300 underline-offset-4 hover:underline">
        ← All onboarding links
      </Link>
      <div className="mt-6 flex max-w-3xl flex-col gap-8">
        <div>
          <p className="text-label text-paper-500">Client intake</p>
          <h1 className="mt-3 text-display-lg">New onboarding link</h1>
          <p className="mt-4 text-body text-paper-300">
            The client opens the intake form with this link, no login needed. Answers save as they type. We send the link ourselves: nothing is emailed to the client.
          </p>
        </div>
        <NewInviteForm
          leads={leads}
          initialLeadId={typeof lead === "string" ? lead : ""}
          validity={VALIDITY.map(({ value, label }) => ({ value, label }))}
          defaultValidity={DEFAULT_VALIDITY}
        />
      </div>
    </Shell>
  );
}
