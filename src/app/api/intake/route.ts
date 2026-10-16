import { after, NextResponse, type NextRequest } from "next/server";
import { intakeProgress, missingRequired, sanitizeAnswers, ANSWERS_MAX_BYTES } from "@/lib/intake/answers";
import { INTAKE_TOKEN_FORMAT, inviteMeta, openIntake, saveIntake, submitIntake } from "@/lib/intake/invites";
import { clientIp, createRateLimiter } from "@/lib/intake/ip-limit";
import { notifyIntakeSubmitted } from "@/lib/intake/notify";
import type { IntakeResult } from "@/lib/intake/protocol";
import { site } from "@/content/site";

// Public endpoint of /intake/<token> (open, autosave, submit). No session: every call validates the
// token and the payload, and the database function re-checks the invite (expiry, revoked, submitted)
// and the per-token rate limit. A route handler rather than server actions: server actions on this
// separate root layout made Turbopack split the RSC client runtime into an extra chunk that every
// public page then loaded (+1 script, +2 KB, measured 16-10).

/** Answers plus JSON overhead; anything bigger is refused before the body is read. */
const MAX_BODY_BYTES = ANSWERS_MAX_BYTES + 1024;

/** Per IP, before anything else (body, token, database). A client autosaving uses ~1 request a second. */
const IP_LIMIT_PER_MINUTE = 120;
const ipLimit = createRateLimiter({ limit: IP_LIMIT_PER_MINUTE, windowMs: 60_000 });

const reply = (result: IntakeResult, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(result, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex", ...headers } });

export async function POST(request: NextRequest) {
  const ip = ipLimit(clientIp(request.headers));
  // The form treats 429 like the per-token limit: "Saving…", local copy kept, quiet back-off.
  if (!ip.isAllowed) return reply({ status: "rate_limited" }, 429, { "Retry-After": String(ip.retryAfterS) });
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
  const status = await submitIntake(token, clean.answers, progress);
  if (status === "ok") {
    // Production links point at the domain, never at a caller-supplied Host; previews link to themselves.
    const origin = process.env.VERCEL_ENV === "production" ? site.domainUrl : request.nextUrl.origin;
    // After the response: the client sees "Thank you" without waiting for the email.
    after(async () => {
      const meta = await inviteMeta(token);
      if (meta) await notifyIntakeSubmitted(meta, clean.answers, progress, origin);
    });
  }
  return reply({ status, progress });
}
