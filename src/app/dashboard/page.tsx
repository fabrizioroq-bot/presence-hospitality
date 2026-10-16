import Link from "next/link";
import { AccessLinkButton } from "@/components/dashboard/AccessLinkButton";
import { Shell } from "@/components/dashboard/Shell";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/cn";
import { ACCESS_LINK_DAYS } from "@/lib/dashboard/access-token";
import { requireAdmin } from "@/lib/dashboard/auth";
import {
  applyFilters,
  filtersToQuery,
  parseFilters,
  POSITION_LABEL,
  STATUS_LABEL,
  STATUSES,
  statusCounts,
  type Lead,
} from "@/lib/dashboard/leads";

export const metadata = { title: "Leads" };
const PAGE = 25;

const fmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Amsterdam",
});

export default async function LeadsPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const { supabase, user } = await requireAdmin();
  const sp = await searchParams;
  const f = parseFilters(sp);
  const from = (f.page - 1) * PAGE;

  const query = applyFilters(
    supabase
      .from("leads")
      .select(
        "id,created_at,first_name,last_name,email,hotel_name,position,language,status",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, from + PAGE - 1),
    f,
  );
  const [{ data, count, error }, counts] = await Promise.all([
    query,
    statusCounts(supabase),
  ]);
  const leads = (data ?? []) as Pick<
    Lead,
    | "id"
    | "created_at"
    | "first_name"
    | "last_name"
    | "email"
    | "hotel_name"
    | "position"
    | "language"
    | "status"
  >[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const filtered = Boolean(f.q || f.status || f.lang || f.from || f.to);

  return (
    <Shell email={user.email ?? ""}>
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-label text-paper-500">Demo requests</p>
            <h1 className="mt-3 text-display-lg">Leads</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/pitch"
              className="inline-flex min-h-11 items-center gap-2 rounded-pill px-5 text-body-sm font-semibold ring-1 ring-line-night hover:bg-night-800"
            >
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 3h11v7.5h-11zM8 10.5V13M5.5 13h5" />
              </svg>
              Pitch
            </Link>
            <AccessLinkButton validDays={ACCESS_LINK_DAYS} />
            <a
              href={`/dashboard/export${filtersToQuery(f, { page: 1 })}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-paper-50 px-5 text-body-sm font-semibold text-ink-900 hover:bg-paper-300"
            >
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 2.5v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10" />
              </svg>
              Export CSV{filtered ? " (filtered)" : ""}
            </a>
          </div>
        </div>

        {sp.deleted === "1" && (
          <p
            role="status"
            className="rounded-md border border-success-night/50 bg-success-night/10 p-3 text-body-sm"
          >
            Lead deleted.
          </p>
        )}

        {/* Status overview (also quick filters) */}
        <nav aria-label="Filter by status" className="flex flex-wrap gap-3">
          {STATUSES.map((s) => (
            <a
              key={s}
              href={
                filtersToQuery(f, {
                  status: f.status === s ? "" : s,
                  page: 1,
                }) || "/dashboard"
              }
              aria-current={f.status === s ? "true" : undefined}
              className={cn(
                "flex min-w-36 flex-col gap-1 rounded-lg border px-4 py-3 transition-colors",
                f.status === s
                  ? "border-accent-night bg-night-800"
                  : "border-line-night/60 hover:border-line-night",
              )}
            >
              <span className="text-label text-paper-500">
                {STATUS_LABEL[s]}
              </span>
              <span className="text-heading-md tabular-nums">{counts[s]}</span>
            </a>
          ))}
        </nav>

        {/* Filters */}
        <form
          method="get"
          className="grid gap-4 rounded-xl border border-line-night/60 p-5 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] md:items-end"
        >
          <label className="flex flex-col gap-2 text-body-sm font-semibold">
            Search
            <input
              name="q"
              defaultValue={f.q}
              placeholder="Hotel, name, email or phone"
              className="demo-input"
            />
          </label>
          <label className="flex flex-col gap-2 text-body-sm font-semibold">
            Status
            <select
              name="status"
              defaultValue={f.status}
              className="demo-input"
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-body-sm font-semibold">
            Language
            <select name="lang" defaultValue={f.lang} className="demo-input">
              <option value="">All</option>
              <option value="en">English</option>
              <option value="nl">Dutch</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-body-sm font-semibold">
            From
            <input
              type="date"
              name="from"
              defaultValue={f.from}
              className="demo-input [color-scheme:dark]"
            />
          </label>
          <label className="flex flex-col gap-2 text-body-sm font-semibold">
            To
            <input
              type="date"
              name="to"
              defaultValue={f.to}
              className="demo-input [color-scheme:dark]"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="min-h-12 rounded-pill bg-paper-50 px-5 text-body-sm font-semibold text-ink-900 hover:bg-paper-300"
            >
              Apply
            </button>
            {filtered && (
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 items-center rounded-pill px-4 text-body-sm font-semibold ring-1 ring-line-night hover:bg-night-800"
              >
                Reset
              </Link>
            )}
          </div>
        </form>

        {error ? (
          <p role="alert" className="text-danger-night">
            Couldn&apos;t load leads. Please refresh.
          </p>
        ) : leads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-night/60 p-12 text-center text-paper-300">
            {filtered
              ? "No leads match these filters."
              : "No leads yet. New demo requests will appear here."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line-night/60">
            <table className="w-full min-w-[760px] text-left text-body-sm">
              <caption className="sr-only">Leads, newest first</caption>
              <thead className="text-label text-paper-500">
                <tr className="border-b border-line-night/60">
                  <th scope="col" className="px-5 py-4 font-medium">
                    Received
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    Hotel
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    Contact
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    Position
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    Lang
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr
                    key={l.id}
                    className="group border-b border-line-night/30 last:border-0 hover:bg-night-800/70"
                  >
                    <td className="px-5 py-4 whitespace-nowrap text-paper-300 tabular-nums">
                      {fmt.format(new Date(l.created_at))}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      <a
                        href={`/dashboard/leads/${l.id}`}
                        className="underline-offset-4 group-hover:underline"
                      >
                        {l.hotel_name}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block">
                        {l.first_name} {l.last_name}
                      </span>
                      <span className="block text-paper-500">{l.email}</span>
                    </td>
                    <td className="px-5 py-4 text-paper-300">
                      {POSITION_LABEL[l.position]}
                    </td>
                    <td className="px-5 py-4 text-label text-paper-300">
                      {l.language}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <nav
            aria-label="Pagination"
            className="flex items-center justify-between text-body-sm"
          >
            <span className="text-paper-500">
              Page {f.page} of {pages} · {total} leads
            </span>
            <span className="flex gap-2">
              {f.page > 1 && (
                <a
                  href={filtersToQuery(f, { page: f.page - 1 }) || "/dashboard"}
                  className="rounded-pill px-4 py-2 ring-1 ring-line-night hover:bg-night-800"
                >
                  ← Newer
                </a>
              )}
              {f.page < pages && (
                <a
                  href={filtersToQuery(f, { page: f.page + 1 })}
                  className="rounded-pill px-4 py-2 ring-1 ring-line-night hover:bg-night-800"
                >
                  Older →
                </a>
              )}
            </span>
          </nav>
        )}
      </div>
    </Shell>
  );
}
