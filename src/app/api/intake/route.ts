import { NextResponse, type NextRequest } from "next/server";
import { intakeProgress, missingRequired, sanitizeAnswers, ANSWERS_MAX_BYTES } from "@/lib/intake/answers";
import { INTAKE_TOKEN_FORMAT, openIntake, saveIntake, submitIntake } from "@/lib/intake/invites";
import type { IntakeResult } from "@/lib/intake/protocol";

// Public endpoint of /intake/<token> (open, autosave, submit). No session: every call validates the
// token and the payload, and the database function re-checks the invite (expiry, revoked, submitted)
// and the per-token rate limit. A route handler rather than server actions: server actions on this
// separate root layout made Turbopack split the RSC client runtime into an extra chunk that every
// public page then loaded (+1 script, +2 KB, measured 16-10).

/** Answers plus JSON overhead; anything bigger is refused before the body is read. */
const MAX_BODY_BYTES = ANSWERS_MAX_BYTES + 1024;

const reply = (result: IntakeResult, status = 200) =>
  NextResponse.json(result, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

export async function POST(request: NextRequest) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (!length || length > MAX_BODY_BYTES) return reply({ status: "invalid" }, 413);
  let body: { action?: unknown; token?: unknown; answers?: unknown };
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return reply({ status: "invalid" }, 413);
    body = JSON.parse(text) as typeof body;
  } catch {
    return reply({ status: "invalid" }, 400);
  }
  const { action, token, answers } = body;
  if (typeof token !== "string" || !INTAKE_TOKEN_FORMAT.test(token)) return reply({ status: "invalid" }, 400);

  if (action === "open") return reply({ status: await openIntake(token) });
  if (action !== "save" && action !== "submit") return reply({ status: "invalid" }, 400);

  const clean = sanitizeAnswers(answers);
  if (!clean.ok) {
    console.warn("[intake] rejected payload:", clean.reason);
    return reply({ status: "invalid" }, 422);
  }
  const progress = intakeProgress(clean.answers);
  if (action === "save") {
    const status = await saveIntake(token, clean.answers, progress);
    return reply({ status, progress }, status === "rate_limited" ? 429 : 200);
  }
  const missing = missingRequired(clean.answers);
  if (missing.length) return reply({ status: "invalid", missing }, 422);
  return reply({ status: await submitIntake(token, clean.answers, progress), progress });
}
