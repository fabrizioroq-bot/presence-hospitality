import {
  CHOICE_LABELS,
  INTAKE_FIELDS,
  otherTextKey,
  type IntakeDoc,
  type IntakeItem,
  type IntakeLang,
} from "@/content/onboarding-form";
import type { Answers } from "@/lib/intake/answers";
import { formatIntakeDate } from "@/lib/intake/format";
import { cx } from "@/lib/cx";

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

function Row({ item, answers, lang, notAnswered }: { item: IntakeItem; answers: Answers; lang: IntakeLang; notAnswered: string }) {
  const text = answerText(item, answers, lang);
  const isCheck = INTAKE_FIELDS[item.key].kind === "check";
  return (
    <div className={cx("grid gap-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6", !text && "opacity-55")}>
      <dt className="text-body-sm font-semibold text-(--ph-text-primary)">{item.label}</dt>
      <dd className="text-body-sm whitespace-pre-wrap text-(--ph-text-secondary)">
        {text ?? (isCheck ? "—" : notAnswered)}
      </dd>
    </div>
  );
}

/** Read-only answers grouped like the form; unanswered fields are dimmed. Server-renderable. */
export function IntakeSummary({ doc, answers, lang, notAnswered }: { doc: IntakeDoc; answers: Answers; lang: IntakeLang; notAnswered: string }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="ui-card p-5 sm:p-8">
        <dl className="divide-y divide-(--ph-border-subtle)">
          {doc.ident.map((item) => (
            <Row key={item.key} item={item} answers={answers} lang={lang} notAnswered={notAnswered} />
          ))}
        </dl>
      </section>
      {doc.sections.map((s) => (
        <section key={s.id} className="ui-card flex flex-col gap-5 p-5 sm:p-8">
          <h2 className="text-heading-md text-(--ph-brand-primary)">{s.title}</h2>
          {s.groups.map((g, i) => (
            <div key={`${s.id}-${i}`} className="flex flex-col gap-1">
              {g.title && <h3 className="text-heading-sm text-(--ph-brand-primary)">{g.title}</h3>}
              <dl className="divide-y divide-(--ph-border-subtle)">
                {g.items.map((item) => (
                  <Row key={item.key} item={item} answers={answers} lang={lang} notAnswered={notAnswered} />
                ))}
              </dl>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
