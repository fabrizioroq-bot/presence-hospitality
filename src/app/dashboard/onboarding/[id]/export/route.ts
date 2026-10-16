import { NextResponse, type NextRequest } from "next/server";
import { INTAKE_FORM } from "@/content/onboarding-form";
import { isAdmin } from "@/lib/dashboard/auth";
import { csvCell } from "@/lib/dashboard/leads";
import { displayStatus, getInvite } from "@/lib/intake/admin";
import { summaryRows } from "@/lib/intake/summary";
import { supabaseServer } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/i;
const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

const fileName = (property: string, ext: string) =>
  `presence-onboarding-${property.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "client"}.${ext}`;

// One onboarding's answers as CSV (question per row) or JSON (raw answers by key + labeled rows).
// Admins only; RLS enforces it again at the database.
export async function GET(request: NextRequest, { params }: RouteContext<"/dashboard/onboarding/[id]/export">) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdmin(user)) return new NextResponse("Forbidden", { status: 403 });
  if (!UUID.test(id)) return new NextResponse("Not found", { status: 404 });
  const { invite, error } = await getInvite(supabase, id);
  if (error) return new NextResponse("Export failed", { status: 500 });
  if (!invite) return new NextResponse("Not found", { status: 404 });

  const answers = invite.onboarding_responses?.answers ?? {};
  const rows = summaryRows(INTAKE_FORM.en, answers, "en");

  if (request.nextUrl.searchParams.get("format") === "json") {
    const body = {
      property: invite.property_name,
      contact_email: invite.contact_email,
      form_language: invite.language,
      status: displayStatus(invite),
      progress: invite.onboarding_responses?.progress ?? 0,
      created_at: invite.created_at,
      submitted_at: invite.submitted_at,
      answers,
      questions: rows,
    };
    return new NextResponse(JSON.stringify(body, null, 2), {
      headers: { ...HEADERS, "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName(invite.property_name, "json")}"` },
    });
  }

  const columns = ["section", "group", "question", "key", "answer"] as const;
  const lines = [columns.join(","), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(","))];
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: { ...HEADERS, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName(invite.property_name, "csv")}"` },
  });
}
