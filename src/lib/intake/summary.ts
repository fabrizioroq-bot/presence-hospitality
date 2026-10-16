// Answers as text, for the read-only summary, the dashboard and the CSV/JSON export. No dependencies.
import { CHOICE_LABELS, INTAKE_FIELDS, otherTextKey, type IntakeDoc, type IntakeItem, type IntakeLang } from "@/content/onboarding-form";
import type { Answers } from "./answers";
import { formatIntakeDate } from "./format";

/** The answer as text, or null when the field is unanswered. */
export function answerText(item: IntakeItem, answers: Answers, lang: IntakeLang): string | null {
  const v = answers[item.key];
  if (v === undefined || v === "" || v === false) return null;
  const kind = INTAKE_FIELDS[item.key].kind;
  if (kind === "date" && typeof v === "string") return formatIntakeDate(v, lang);
  if ((kind === "yesNo" || kind === "yesNoUnknown") && typeof v === "string") {
    return CHOICE_LABELS[lang][v as keyof (typeof CHOICE_LABELS)["en"]] ?? v;
  }
  if (kind === "checkOther") {
    const text = answers[otherTextKey(item.key)];
    return typeof text === "string" && text ? text : "✓";
  }
  return v === true ? "✓" : String(v);
}

export type SummaryRow = { section: string; group: string; question: string; key: string; answer: string | null };

/** Every question in form order with its answer (null = unanswered). */
export function summaryRows(doc: IntakeDoc, answers: Answers, lang: IntakeLang): SummaryRow[] {
  const ident = doc.ident.map((item) => ({ section: doc.title, group: "", question: item.label, key: item.key, answer: answerText(item, answers, lang) }));
  const rest = doc.sections.flatMap((s) =>
    s.groups.flatMap((g) =>
      g.items.map((item) => ({ section: s.title, group: g.title ?? "", question: item.label, key: item.key, answer: answerText(item, answers, lang) })),
    ),
  );
  return [...ident, ...rest];
}
