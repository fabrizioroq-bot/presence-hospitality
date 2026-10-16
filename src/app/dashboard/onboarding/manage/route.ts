import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/dashboard/auth";
import {
  createInvite,
  extendInvite,
  regenerateInvite,
  reopenInvite,
  revokeInvite,
  type Fields,
  type InviteFormState,
} from "@/lib/intake/manage";
import { supabaseServer } from "@/lib/supabase/server";

// Mutations of onboarding links from the dashboard (create, extend, new link, revoke, reopen).
// Admin session required; same-origin JSON only, so other sites can't drive it with the admin's cookie.

const MAX_BODY_BYTES = 4096;
const OPS = ["create", "extend", "regenerate", "revoke", "reopen"] as const;
type Op = (typeof OPS)[number];

const reply = (body: InviteFormState, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) return reply({ error: "Forbidden" }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "Bad request" }, 415);
  if (Number(request.headers.get("content-length") ?? "0") > MAX_BODY_BYTES) return reply({ error: "Too large" }, 413);

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return reply({ error: "Your session has ended. Sign in again." }, 401);

  let body: { op?: unknown; id?: unknown; fields?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return reply({ error: "Bad request" }, 400);
  }
  const op = body.op as Op;
  if (!OPS.includes(op)) return reply({ error: "Bad request" }, 400);
  const id = typeof body.id === "string" ? body.id : "";
  const raw = typeof body.fields === "object" && body.fields !== null ? (body.fields as Record<string, unknown>) : {};
  const fields: Fields = Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === "string")) as Fields;

  switch (op) {
    case "create":
      return reply(await createInvite(supabase, user.id, fields));
    case "extend":
      return reply(await extendInvite(supabase, id, fields));
    case "regenerate":
      return reply(await regenerateInvite(supabase, id, fields));
    case "revoke":
      return reply(await revokeInvite(supabase, id));
    case "reopen":
      return reply(await reopenInvite(supabase, id));
  }
}
