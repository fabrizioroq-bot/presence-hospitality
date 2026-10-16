// Shared by the intake form (client), the read-only summary and the dashboard. No dependencies.
import type { IntakeLang } from "@/content/onboarding-form";

/** UI strings of the intake (messages/*.json → "intake"), passed to client components as props. */
export const INTAKE_STRING_KEYS = [
  "skip", "start", "review", "next", "back", "stepOf", "progress", "sections", "language",
  "saving", "saved", "offline", "retrying", "locked", "required", "requiredHint", "invalidEmail",
  "answered", "reviewTitle", "reviewLead", "submit", "confirmTitle", "confirmBody", "confirmYes",
  "confirmNo", "submitting", "submitError", "thanksTitle", "sentOn", "notAnswered", "privacy",
  "privacyLink", "datePick", "restored",
] as const;
export type IntakeStrings = Record<(typeof INTAKE_STRING_KEYS)[number], string>;

/** Fills "{name}" placeholders in a raw message template. */
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));

const EN_DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** "2026-10-16" → "16 Oct 2026" (EN) or "16-10-2026" (NL). Anything else is returned unchanged. */
export function formatIntakeDate(iso: string, lang: IntakeLang): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  if (lang === "nl") return `${d}-${mo}-${y}`;
  return EN_DATE.format(new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d))));
}

/** Today's date in the visitor's time zone, as "yyyy-mm-dd". */
export function todayIso(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
