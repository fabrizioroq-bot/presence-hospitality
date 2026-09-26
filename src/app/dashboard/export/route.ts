import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/dashboard/auth";
import { applyFilters, csvCell, parseFilters } from "@/lib/dashboard/leads";
import { supabaseServer } from "@/lib/supabase/server";

const COLUMNS = [
  "created_at", "first_name", "last_name", "email", "phone", "position", "hotel_name", "pms",
  "language", "status", "status_updated_at", "gdpr_consent_at", "source", "description", "notes",
] as const;

// CSV export of the (filtered) lead list. Admins only; RLS enforces it again at the database.
export async function GET(request: NextRequest) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdmin(user)) return new NextResponse("Forbidden", { status: 403 });

  const f = parseFilters(Object.fromEntries(request.nextUrl.searchParams));
  const { data, error } = await applyFilters(
    supabase.from("leads").select(COLUMNS.join(",")).order("created_at", { ascending: false }).limit(5000),
    f,
  );
  if (error) return new NextResponse("Export failed", { status: 500 });

  const lines = [COLUMNS.join(","), ...((data ?? []) as unknown as Record<string, unknown>[]).map((r) => COLUMNS.map((c) => csvCell(r[c])).join(","))];
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="presence-leads-${stamp}.csv"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
