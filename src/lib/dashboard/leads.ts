import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { POSITIONS } from "@/lib/leads/validate";

export const STATUSES = [
  "new",
  "contacted",
  "demo_scheduled",
  "won",
  "lost",
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  contacted: "Contacted",
  demo_scheduled: "Demo scheduled",
  won: "Won",
  lost: "Lost",
};

export const POSITION_LABEL: Record<(typeof POSITIONS)[number], string> = {
  owner: "Owner",
  general_manager: "General manager",
  operations_manager: "Operations manager",
  front_office_manager: "Front office manager",
  other: "Other",
};

export type Lead = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: (typeof POSITIONS)[number];
  hotel_name: string;
  pms: string | null;
  description: string;
  language: "en" | "nl";
  gdpr_consent: boolean;
  gdpr_consent_at: string;
  source: string;
  status: Status;
  status_updated_at: string | null;
  notes: string | null;
};

export type Filters = {
  q: string;
  status: Status | "";
  lang: "en" | "nl" | "";
  from: string;
  to: string;
  page: number;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): Filters {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) ?? "";
  const status = one("status");
  const lang = one("lang");
  return {
    // Strip characters that have meaning in PostgREST filter syntax.
    q: one("q")
      .replace(/[,()*%\\]/g, " ")
      .trim()
      .slice(0, 80),
    status: (STATUSES as readonly string[]).includes(status)
      ? (status as Status)
      : "",
    lang: lang === "en" || lang === "nl" ? lang : "",
    from: DATE.test(one("from")) ? one("from") : "",
    to: DATE.test(one("to")) ? one("to") : "",
    page: Math.max(1, Math.min(1000, parseInt(one("page") || "1", 10) || 1)),
  };
}

/** Applies the filters to a leads query (shared by the list and the CSV export). */
type Filterable<Q> = {
  eq(column: string, value: string): Q;
  or(filters: string): Q;
  gte(column: string, value: string): Q;
  lt(column: string, value: string): Q;
};

export function applyFilters<Q extends Filterable<Q>>(query: Q, f: Filters): Q {
  let q = query;
  if (f.status) q = q.eq("status", f.status);
  if (f.lang) q = q.eq("language", f.lang);
  if (f.q) {
    const s = `%${f.q}%`;
    q = q.or(
      `hotel_name.ilike.${s},email.ilike.${s},first_name.ilike.${s},last_name.ilike.${s},phone.ilike.${s}`,
    );
  }
  if (f.from) q = q.gte("created_at", `${f.from}T00:00:00Z`);
  if (f.to) {
    const d = new Date(`${f.to}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    q = q.lt("created_at", d.toISOString());
  }
  return q;
}

export async function statusCounts(supabase: SupabaseClient) {
  const entries = await Promise.all(
    STATUSES.map(async (s) => {
      const { count } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", s);
      return [s, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<Status, number>;
}

export const filtersToQuery = (f: Filters, patch: Partial<Filters> = {}) => {
  const m = { ...f, ...patch };
  const p = new URLSearchParams();
  if (m.q) p.set("q", m.q);
  if (m.status) p.set("status", m.status);
  if (m.lang) p.set("lang", m.lang);
  if (m.from) p.set("from", m.from);
  if (m.to) p.set("to", m.to);
  if (m.page > 1) p.set("page", String(m.page));
  const s = p.toString();
  return s ? `?${s}` : "";
};

/** CSV cell: quoted, and neutralised against spreadsheet formula injection. */
export function csvCell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
