"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { InviteFormState } from "@/lib/intake/manage";
import { manage } from "./manage-client";
import { ShareResult } from "./ShareResult";

export type LeadOption = { id: string; hotel: string; contact: string; email: string; language: "en" | "nl" };
type ValidityOption = { value: string; label: string };

const label = "flex flex-col gap-2 text-body-sm font-semibold";
const INIT: InviteFormState = {};

/** New onboarding link: optionally from a lead (prefills property, email and language). */
export function NewInviteForm({
  leads,
  initialLeadId,
  validity,
  defaultValidity,
}: {
  leads: LeadOption[];
  initialLeadId: string;
  validity: readonly ValidityOption[];
  defaultValidity: string;
}) {
  const [state, action, pending] = useActionState((_: InviteFormState, fd: FormData) => manage("create", undefined, fd), INIT);
  const initial = leads.find((l) => l.id === initialLeadId);
  const [leadId, setLeadId] = useState(initial?.id ?? "");
  const [property, setProperty] = useState(initial?.hotel ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [language, setLanguage] = useState<"en" | "nl">(initial?.language ?? "en");

  const pickLead = (id: string) => {
    setLeadId(id);
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    setProperty(lead.hotel);
    setEmail(lead.email);
    setLanguage(lead.language);
  };

  if (state.share && state.id) {
    return (
      <div className="flex flex-col gap-6">
        <ShareResult share={state.share} />
        <div className="flex flex-wrap gap-3">
          <Link href={`/dashboard/onboarding/${state.id}`} className="inline-flex min-h-11 items-center rounded-pill bg-paper-50 px-5 text-body-sm font-semibold text-ink-900 hover:bg-paper-300">
            Open the onboarding
          </Link>
          <Link href="/dashboard/onboarding" className="inline-flex min-h-11 items-center rounded-pill px-5 text-body-sm font-semibold ring-1 ring-line-night hover:bg-night-800">
            Back to the list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-5 rounded-xl border border-line-night/60 p-5 sm:grid-cols-2 sm:p-8">
      <label className={`${label} sm:col-span-2`}>
        Lead (optional)
        <select name="lead" value={leadId} onChange={(e) => pickLead(e.target.value)} className="demo-input">
          <option value="">No lead: fill in below</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.hotel} · {l.contact}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Property name
        <input name="property" required maxLength={120} value={property} onChange={(e) => setProperty(e.target.value)} className="demo-input" />
      </label>
      <label className={label}>
        Contact email (optional)
        <input name="email" type="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} className="demo-input" />
      </label>
      <label className={label}>
        Form language
        <select name="language" value={language} onChange={(e) => setLanguage(e.target.value as "en" | "nl")} className="demo-input">
          <option value="en">English</option>
          <option value="nl">Dutch</option>
        </select>
      </label>
      <label className={label}>
        Valid for
        <select name="validity" defaultValue={defaultValidity} className="demo-input">
          {validity.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-start gap-3 text-body-sm sm:col-span-2">
        <input type="checkbox" name="test" className="demo-check mt-0.5" />
        <span>
          <span className="font-semibold">Test link</span>
          <span className="block text-paper-500">For demos and trials: hidden from the list by default, no email when submitted.</span>
        </span>
      </label>
      {state.error && (
        <p role="alert" className="rounded-md border border-danger-night/60 bg-danger-night/10 p-3 text-body-sm sm:col-span-2">
          {state.error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center rounded-pill bg-paper-50 px-6 text-body-sm font-semibold text-ink-900 hover:bg-paper-300 disabled:opacity-60">
          {pending ? "Creating…" : "Create link"}
        </button>
      </div>
    </form>
  );
}
