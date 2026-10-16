"use client";

import {
  CHOICE_LABELS,
  CHOICE_VALUES,
  INTAKE_FIELDS,
  otherTextKey,
  type IntakeGroup,
  type IntakeItem,
  type IntakeLang,
} from "@/content/onboarding-form";
import { LONG_TEXT_MAX, TEXT_MAX, type Answers } from "@/lib/intake/answers";
import { formatIntakeDate, type IntakeStrings } from "@/lib/intake/format";
import { join as cx } from "./ui";

export type FieldContext = {
  lang: IntakeLang;
  answers: Answers;
  onChange: (key: string, value: string | boolean) => void;
  /** Keys whose value is missing or invalid (identification block, after a submit attempt). */
  errors: ReadonlyMap<string, string>;
  strings: IntakeStrings;
  required?: boolean;
};

export const fieldId = (key: string) => `f-${key.replace(/\./g, "-")}`;
const str = (v: unknown) => (typeof v === "string" ? v : "");

function Label({ htmlFor, text, required, strings }: { htmlFor?: string; text: string; required?: boolean; strings: IntakeStrings }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-wrap items-baseline justify-between gap-x-3 text-body-sm font-semibold text-(--ph-text-primary)">
      {text}
      {required && <span className="text-body-sm font-normal text-(--ph-text-muted)">{strings.required}</span>}
    </label>
  );
}

function ErrorText({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} className="text-body-sm text-(--ph-error)">
      {text}
    </p>
  );
}

const AUTOCOMPLETE: Record<string, string> = {
  "id.property_name": "organization",
  "id.contact_name": "name",
  "id.role": "organization-title",
  "id.email": "email",
  "id.phone": "tel",
  "id.address": "street-address",
};

function TextField({ item, ctx, long }: { item: IntakeItem; ctx: FieldContext; long: boolean }) {
  const id = fieldId(item.key);
  const error = ctx.errors.get(item.key);
  const common = {
    id,
    name: item.key,
    value: str(ctx.answers[item.key]),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-err` : undefined,
    className: "intake-input",
  };
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} text={item.label} required={ctx.required} strings={ctx.strings} />
      {long ? (
        <textarea {...common} rows={4} maxLength={LONG_TEXT_MAX} onChange={(e) => ctx.onChange(item.key, e.target.value)} />
      ) : (
        <input
          {...common}
          type={item.key === "id.email" ? "email" : item.key === "id.phone" ? "tel" : "text"}
          autoComplete={AUTOCOMPLETE[item.key] ?? "off"}
          maxLength={TEXT_MAX}
          onChange={(e) => ctx.onChange(item.key, e.target.value)}
        />
      )}
      <ErrorText id={`${id}-err`} text={error} />
    </div>
  );
}

/** Native date picker under a box that shows the date in the form's language. */
function DateField({ item, ctx }: { item: IntakeItem; ctx: FieldContext }) {
  const id = fieldId(item.key);
  const value = str(ctx.answers[item.key]);
  const error = ctx.errors.get(item.key);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} text={item.label} required={ctx.required} strings={ctx.strings} />
      <div className="intake-date">
        <div aria-hidden className={cx("intake-input flex items-center justify-between", !value && "text-(--ph-text-muted)")}>
          {value ? formatIntakeDate(value, ctx.lang) : ctx.strings.datePick}
          <svg viewBox="0 0 16 16" className="h-4 w-4 text-(--ph-text-secondary)" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
            <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
            <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
          </svg>
        </div>
        <input
          id={id}
          type="date"
          lang={ctx.lang}
          value={value}
          onChange={(e) => ctx.onChange(item.key, e.target.value)}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker();
            } catch {
              // Browsers without showPicker() open the picker themselves.
            }
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
        />
      </div>
      <ErrorText id={`${id}-err`} text={error} />
    </div>
  );
}

function ChoiceField({ item, ctx }: { item: IntakeItem; ctx: FieldContext }) {
  const kind = INTAKE_FIELDS[item.key].kind as "yesNo" | "yesNoUnknown";
  const value = str(ctx.answers[item.key]);
  return (
    <fieldset>
      <legend className="mb-3 text-body-sm font-semibold text-(--ph-text-primary)">{item.label}</legend>
      <div className="flex flex-wrap gap-2">
        {CHOICE_VALUES[kind].map((v) => (
          <label key={v} className="intake-choice">
            <input
              type="radio"
              name={item.key}
              value={v}
              checked={value === v}
              onChange={() => ctx.onChange(item.key, v)}
              // Clicking the chosen option again clears it (radios can't be unticked otherwise).
              onClick={() => value === v && ctx.onChange(item.key, "")}
            />
            {CHOICE_LABELS[ctx.lang][v]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CheckField({ item, ctx }: { item: IntakeItem; ctx: FieldContext }) {
  const checked = ctx.answers[item.key] === true;
  const isOther = INTAKE_FIELDS[item.key].kind === "checkOther";
  const textKey = otherTextKey(item.key);
  return (
    <div className={cx("flex flex-col gap-2", isOther && "sm:col-span-2")}>
      <label className="intake-option">
        <input type="checkbox" className="intake-check" checked={checked} onChange={(e) => ctx.onChange(item.key, e.target.checked)} />
        <span className="text-body">{item.label}</span>
      </label>
      {isOther && checked && (
        <input
          className="intake-input"
          aria-label={item.label}
          value={str(ctx.answers[textKey])}
          maxLength={TEXT_MAX}
          onChange={(e) => ctx.onChange(textKey, e.target.value)}
        />
      )}
    </div>
  );
}

function IntakeField({ item, ctx }: { item: IntakeItem; ctx: FieldContext }) {
  switch (INTAKE_FIELDS[item.key].kind) {
    case "text":
      return <TextField item={item} ctx={ctx} long={false} />;
    case "longText":
      return <TextField item={item} ctx={ctx} long />;
    case "date":
      return <DateField item={item} ctx={ctx} />;
    case "yesNo":
    case "yesNoUnknown":
      return <ChoiceField item={item} ctx={ctx} />;
    case "check":
    case "checkOther":
      return <CheckField item={item} ctx={ctx} />;
  }
}

type Layout = "checks" | "short" | "full";
type Run = { layout: Layout; items: IntakeItem[] };

function layoutOf(item: IntakeItem): Layout {
  const kind = INTAKE_FIELDS[item.key].kind;
  if (kind === "check" || kind === "checkOther") return "checks";
  return kind === "longText" ? "full" : "short";
}

/** Consecutive items with the same layout share a grid, so the .docx order is kept. */
function runs(items: readonly IntakeItem[]): Run[] {
  return items.reduce<Run[]>((out, item) => {
    const layout = layoutOf(item);
    const last = out.at(-1);
    return last?.layout === layout
      ? [...out.slice(0, -1), { layout, items: [...last.items, item] }]
      : [...out, { layout, items: [item] }];
  }, []);
}

export function IntakeItems({ items, ctx }: { items: readonly IntakeItem[]; ctx: FieldContext }) {
  return (
    <div className="flex flex-col gap-6">
      {runs(items).map((run) => (
        <div
          key={run.items[0].key}
          className={cx(
            "grid gap-x-5",
            run.layout === "checks" ? "gap-y-2.5 sm:grid-cols-2" : "gap-y-6",
            run.layout === "short" && "sm:grid-cols-2",
          )}
        >
          {run.items.map((item) => (
            <IntakeField key={item.key} item={item} ctx={ctx} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function IntakeGroupView({ group, ctx }: { group: IntakeGroup; ctx: FieldContext }) {
  return (
    <section className="flex flex-col gap-4">
      {group.title && <h3 className="text-heading-sm text-(--ph-brand-primary)">{group.title}</h3>}
      <IntakeItems items={group.items} ctx={ctx} />
    </section>
  );
}
