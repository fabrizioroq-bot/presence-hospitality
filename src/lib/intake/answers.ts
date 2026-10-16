// Intake answers: validation and progress. Shared by the form (client) and the server actions; no
// dependencies, so the client bundle only gets the field specs it already needs.
import { CHOICE_VALUES, INTAKE_FIELDS, REQUIRED_KEYS, otherTextKey, type FieldKey, type FieldSpec } from "@/content/onboarding-form";

/** Field key → answer. Text and date: string; Yes/No: "yes" | "no" | "unknown"; checkbox: true. */
export type Answers = Readonly<Record<string, string | boolean>>;

export const TEXT_MAX = 2000;
export const LONG_TEXT_MAX = 5000;
/** Serialized size cap, below the database's 64 KB check. */
export const ANSWERS_MAX_BYTES = 60_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
// Same rule as lib/leads/validate.ts, copied: importing it shares a chunk with the public demo form.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const FIELD_KEYS = Object.keys(INTAKE_FIELDS) as FieldKey[];
const OTHER_TEXT = new Map(
  FIELD_KEYS.filter((k) => INTAKE_FIELDS[k].kind === "checkOther").map((k) => [otherTextKey(k), k]),
);

const isField = (k: string): k is FieldKey => Object.hasOwn(INTAKE_FIELDS, k);

function validValue(key: string, value: unknown): boolean {
  if (OTHER_TEXT.has(key)) return typeof value === "string" && value.length <= TEXT_MAX;
  if (!isField(key)) return false;
  const { kind } = INTAKE_FIELDS[key];
  switch (kind) {
    case "text":
      return typeof value === "string" && value.length <= TEXT_MAX;
    case "longText":
      return typeof value === "string" && value.length <= LONG_TEXT_MAX;
    case "date":
      return typeof value === "string" && ISO_DATE.test(value);
    case "yesNo":
    case "yesNoUnknown":
      return (CHOICE_VALUES[kind] as readonly string[]).includes(value as string);
    case "check":
    case "checkOther":
      return value === true;
  }
}

const isEmpty = (v: unknown) => v === false || v === "" || v == null;

/**
 * Checks untrusted answers against the form schema. Empty values are dropped; anything unknown,
 * of the wrong type or too long rejects the whole payload (the client never sends such data).
 */
export function sanitizeAnswers(input: unknown): { ok: true; answers: Answers } | { ok: false; reason: string } {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return { ok: false, reason: "shape" };
  const entries = Object.entries(input as Record<string, unknown>).filter(([, v]) => !isEmpty(v));
  for (const [k, v] of entries) {
    if (!validValue(k, v)) return { ok: false, reason: `field ${k.slice(0, 60)}` };
  }
  const answers = Object.fromEntries(entries) as Answers;
  if (JSON.stringify(answers).length > ANSWERS_MAX_BYTES) return { ok: false, reason: "size" };
  return { ok: true, answers };
}

const unitOf = (k: FieldKey): string => (INTAKE_FIELDS[k] as FieldSpec).unit ?? k;
/** Units that count as one answer each: every field, except checkboxes, which count per group. */
const UNITS = new Set(FIELD_KEYS.map(unitOf));

export function intakeProgress(answers: Answers): number {
  const done = new Set(FIELD_KEYS.filter((k) => !isEmpty(answers[k])).map(unitOf));
  return Math.round((done.size / UNITS.size) * 100);
}

/** Required identification fields that are still empty or invalid. */
export function missingRequired(answers: Answers): FieldKey[] {
  return REQUIRED_KEYS.filter((k) => {
    const v = answers[k];
    if (typeof v !== "string" || !v.trim()) return true;
    return k === "id.email" && !EMAIL.test(v.trim());
  });
}

/** How many of these fields have an answer (review step, dashboard). */
export const countAnswered = (keys: readonly FieldKey[], answers: Answers) =>
  keys.filter((k) => !isEmpty(answers[k])).length;
