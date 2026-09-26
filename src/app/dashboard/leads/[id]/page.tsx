import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteLead, LeadEditor } from "@/components/dashboard/LeadEditor";
import { Shell } from "@/components/dashboard/Shell";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { requireAdmin } from "@/lib/dashboard/auth";
import {
  POSITION_LABEL,
  STATUS_LABEL,
  STATUSES,
  type Lead,
} from "@/lib/dashboard/leads";

export const metadata = { title: "Lead" };

const fmt = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Amsterdam",
});
const UUID = /^[0-9a-f-]{36}$/i;

export default async function LeadPage({
  params,
}: PageProps<"/dashboard/leads/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase, user } = await requireAdmin();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const l = data as Lead;

  const rows: [string, React.ReactNode][] = [
    ["Name", `${l.first_name} ${l.last_name}`],
    ["Position", POSITION_LABEL[l.position]],
    [
      "Email",
      <a
        key="e"
        href={`mailto:${l.email}`}
        className="text-holo-300 underline underline-offset-4"
      >
        {l.email}
      </a>,
    ],
    [
      "Phone",
      <a
        key="p"
        href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}
        className="text-holo-300 underline underline-offset-4"
      >
        {l.phone}
      </a>,
    ],
    ["PMS", l.pms ?? "—"],
    ["Language", l.language === "nl" ? "Dutch" : "English"],
    ["Source", l.source],
    ["Received", fmt.format(new Date(l.created_at))],
    ["GDPR consent", `Given ${fmt.format(new Date(l.gdpr_consent_at))}`],
    [
      "Status changed",
      l.status_updated_at ? fmt.format(new Date(l.status_updated_at)) : "—",
    ],
  ];

  return (
    <Shell email={user.email ?? ""}>
      <Link
        href="/dashboard"
        className="text-body-sm text-paper-300 underline-offset-4 hover:underline"
      >
        ← All leads
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-label text-paper-500">Lead</p>
          <h1 className="mt-3 text-display-lg">{l.hotel_name}</h1>
        </div>
        <StatusBadge status={l.status} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <section
          aria-label="Details"
          className="rounded-xl border border-line-night/60 p-6 sm:p-8 lg:col-span-7"
        >
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-[10rem_1fr]">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-label text-paper-500 sm:pt-1">{k}</dt>
                <dd className="text-body">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 border-t border-line-night/50 pt-6">
            <h2 className="text-label text-paper-500">Message</h2>
            <p className="mt-3 text-body-lg whitespace-pre-wrap text-paper-50">
              {l.description}
            </p>
          </div>
        </section>

        <section
          aria-label="Manage"
          className="flex flex-col gap-6 lg:col-span-5"
        >
          <div className="rounded-xl border border-line-night/60 bg-night-800 p-6 sm:p-8">
            <h2 className="text-heading-sm font-extrabold">Pipeline</h2>
            <div className="mt-5">
              <LeadEditor
                id={l.id}
                status={l.status}
                notes={l.notes ?? ""}
                options={STATUSES.map((s) => ({
                  value: s,
                  label: STATUS_LABEL[s],
                }))}
              />
            </div>
          </div>
          <div className="rounded-xl border border-line-night/60 p-6 sm:p-8">
            <h2 className="text-heading-sm font-extrabold">Danger zone</h2>
            <p className="mt-2 text-body-sm text-paper-300">
              Use this for GDPR erasure requests or test entries.
            </p>
            <div className="mt-5">
              <DeleteLead id={l.id} />
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
