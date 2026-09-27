"use server";

import { after } from "next/server";
import { notifyNewLead } from "@/lib/notify";
import { requestOrigin } from "@/lib/origin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateLead, type FieldErrors } from "@/lib/leads/validate";

export type DemoState =
  | { status: "idle" }
  | { status: "success"; firstName: string }
  | { status: "error"; fieldErrors?: FieldErrors; formError?: "server" | "rate" };

const MIN_FILL_MS = 3000;

export async function submitDemoRequest(_prev: DemoState, formData: FormData): Promise<DemoState> {
  const raw = Object.fromEntries(formData) as Record<string, unknown>;
  const language = raw.locale === "nl" ? "nl" : "en";

  // Bots: honeypot filled or submitted implausibly fast → pretend success, store nothing.
  const startedAt = Number(raw.started_at);
  const reason = String(raw.company_website ?? "").length > 0 ? "honeypot" : !startedAt ? "no-start" : Date.now() - startedAt < MIN_FILL_MS ? "too-fast" : null;
  if (reason) {
    console.info(`[demo-request] discarded as bot (${reason})`);
    return { status: "success", firstName: String(raw.first_name ?? "").trim() };
  }

  const result = validateLead({ ...raw, consent: raw.consent === "on" }, language);
  if (!result.ok) return { status: "error", fieldErrors: result.errors };
  const lead = result.data;

  const { data, error } = await supabaseAdmin()
    .from("leads")
    .insert({
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      position: lead.position,
      hotel_name: lead.hotel_name,
      pms: lead.pms,
      description: lead.description,
      language: lead.language,
      gdpr_consent: true,
      source: "website",
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.message?.includes("too_many_requests")) return { status: "error", formError: "rate" };
    console.error("[demo-request] insert failed", error?.code, error?.message);
    return { status: "error", formError: "server" };
  }

  // Send the notification after the response, so the guest never waits on email.
  const origin = await requestOrigin();
  after(() => notifyNewLead({ ...lead, id: data.id }, origin));
  return { status: "success", firstName: lead.first_name };
}
