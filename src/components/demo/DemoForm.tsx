"use client";

import { useActionState, useEffect, useRef, useState, type FocusEvent, type FormEvent, type ReactNode } from "react";
import { submitDemoRequest, type DemoState } from "@/app/actions/demo-request";
import { cx as cn } from "@/lib/cx";
import { FIELDS, LIMITS, POSITIONS, validateField, type ErrorCode, type FieldErrors, type LeadField } from "@/lib/leads/validate";

export type DemoFormLabels = {
  f: Record<Exclude<LeadField, "consent">, string> & { pmsOptional: string };
  ph: Record<"first_name" | "last_name" | "email" | "phone" | "hotel_name" | "pms" | "description", string>;
  positions: Record<(typeof POSITIONS)[number] | "placeholder", string>;
  pmsNotSure: string;
  chars: string; // "{count} / {max} characters"
  submit: string;
  sending: string;
  errors: Record<ErrorCode, string>;
  summary: string;
  server: string; // contains {email}
  rate: string;
  successTitle: string;
  successBody: string; // contains {name}
};

const INITIAL: DemoState = { status: "idle" };
const PMS_SUGGESTIONS = ["Mews", "Apaleo", "Opera", "Protel"];

/**
 * Book-a-demo form: native <form> + Server Action (works without JS), shared validation on
 * blur/submit, error summary with anchors, focus management and a success panel.
 */
export function DemoForm({
  locale,
  labels,
  consentLabel,
  contactEmail,
}: {
  locale: "en" | "nl";
  labels: DemoFormLabels;
  consentLabel: ReactNode;
  contactEmail: string;
}) {
  const [state, formAction, pending] = useActionState(submitDemoRequest, INITIAL);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [edited, setEdited] = useState<Set<LeadField>>(new Set());
  const [summary, setSummary] = useState(false);
  const [descLen, setDescLen] = useState(0);
  // Time-trap start. Kept in state: on hidden inputs the value *is* the attribute, so a
  // re-render with defaultValue="" would wipe a value set directly on the DOM.
  const [startedAt, setStartedAt] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const formErrorRef = useRef<HTMLParagraphElement>(null);

  // Server errors apply until the user edits that field again (then the client check wins).
  const serverErrors = state.status === "error" ? state.fieldErrors ?? {} : {};
  const errorOf = (f: LeadField): ErrorCode | undefined => (edited.has(f) ? clientErrors[f] : clientErrors[f] ?? serverErrors[f]);
  const invalid = FIELDS.filter((f) => errorOf(f));

  // Time-trap for bots: start the clock after hydration (not in the SSR HTML).
  useEffect(() => {
    const id = requestAnimationFrame(() => setStartedAt(String(Date.now())));
    return () => cancelAnimationFrame(id);
  }, []);

  // Focus management after the server responds.
  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
    if (state.status === "error") {
      const first = FIELDS.find((f) => state.fieldErrors?.[f]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      else formErrorRef.current?.focus();
    }
  }, [state]);

  const message = (code: ErrorCode) => labels.errors[code].replace("{min}", String(LIMITS.descMin));

  const check = (f: LeadField, value: unknown) => {
    const e = validateField(f, value);
    setClientErrors((prev) => ({ ...prev, [f]: e }));
    setEdited((prev) => new Set(prev).add(f));
  };

  const onBlur = (e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const f = e.target.name as LeadField;
    if (!FIELDS.includes(f)) return;
    check(f, e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value);
  };

  const onChange = (e: FormEvent<HTMLFormElement>) => {
    const t = e.target as HTMLInputElement;
    const f = t.name as LeadField;
    if (f === "description") setDescLen(t.value.length);
    // Once a field has an error, re-validate it live so the message clears as soon as it's fixed.
    if (FIELDS.includes(f) && errorOf(f)) check(f, t.type === "checkbox" ? t.checked : t.value);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const errs: FieldErrors = {};
    for (const f of FIELDS) {
      const v = f === "consent" ? fd.get("consent") === "on" : fd.get(f);
      const err = validateField(f, v);
      if (err) errs[f] = err;
    }
    setClientErrors(errs);
    setEdited(new Set(FIELDS));
    if (Object.keys(errs).length) {
      e.preventDefault(); // the Server Action does not run
      setSummary(true);
      const first = FIELDS.find((f) => errs[f]);
      const form = e.currentTarget; // React clears currentTarget after the handler returns
      requestAnimationFrame(() => form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
    } else {
      setSummary(false);
    }
  };

  if (state.status === "success") {
    return (
      <div className="relative flex min-h-[420px] flex-col items-start justify-center gap-4 overflow-hidden">
        <span aria-hidden className="success-burst">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ "--a": `${i * 30}deg`, "--d": `${i * 25}ms` } as React.CSSProperties} className={i === 7 ? "warm" : undefined} />
          ))}
        </span>
        <h3 ref={successRef} tabIndex={-1} className="success-title text-display-lg text-paper-50 outline-none">
          {labels.successTitle}
        </h3>
        <p className="max-w-[40ch] text-body-lg text-paper-300">{labels.successBody.replace("{name}", state.firstName)}</p>
      </div>
    );
  }

  const field = (f: Exclude<LeadField, "consent" | "position" | "description" | "pms">, type: string, autoComplete: string, extra?: Record<string, string>) => {
    const err = errorOf(f);
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={`demo-${f}`} className="text-body-sm font-semibold text-paper-50">
          {labels.f[f]}
        </label>
        <input
          id={`demo-${f}`}
          name={f}
          type={type}
          autoComplete={autoComplete}
          placeholder={labels.ph[f]}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `demo-${f}-err` : undefined}
          onBlur={onBlur}
          className={cn("demo-input", err && "is-invalid")}
          {...extra}
        />
        {err && <FieldError id={`demo-${f}-err`}>{message(err)}</FieldError>}
      </div>
    );
  };

  const posErr = errorOf("position");
  const descErr = errorOf("description");
  const pmsErr = errorOf("pms");
  const consentErr = errorOf("consent");

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} onChange={onChange} noValidate className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="started_at" value={startedAt} readOnly />
      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {summary && invalid.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-md border border-danger-night/60 bg-danger-night/10 p-4 text-body-sm text-paper-50">
          <p className="font-semibold">{labels.summary}</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {invalid.map((f) => (
              <li key={f}>
                <a href={`#demo-${f}`} className="text-danger-night underline underline-offset-4">
                  {f === "consent" ? labels.errors.consent : labels.f[f as Exclude<LeadField, "consent">]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {state.status === "error" && state.formError && (
        <p ref={formErrorRef} tabIndex={-1} role="alert" className="rounded-md border border-danger-night/60 bg-danger-night/10 p-4 text-body-sm text-paper-50">
          {state.formError === "rate" ? labels.rate : labels.server.replace("{email}", contactEmail)}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {field("first_name", "text", "given-name", { maxLength: String(LIMITS.name) })}
        {field("last_name", "text", "family-name", { maxLength: String(LIMITS.name) })}
        {field("email", "email", "email", { maxLength: String(LIMITS.email), inputMode: "email" })}
        {field("phone", "tel", "tel", { maxLength: String(LIMITS.phoneMax), inputMode: "tel" })}

        <div className="flex flex-col gap-2">
          <label htmlFor="demo-position" className="text-body-sm font-semibold text-paper-50">
            {labels.f.position}
          </label>
          <div className="relative">
            <select
              id="demo-position"
              name="position"
              defaultValue=""
              onBlur={onBlur}
              aria-invalid={posErr ? true : undefined}
              aria-describedby={posErr ? "demo-position-err" : undefined}
              className={cn("demo-input appearance-none pr-10", posErr && "is-invalid")}
            >
              <option value="" disabled>
                {labels.positions.placeholder}
              </option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {labels.positions[p]}
                </option>
              ))}
            </select>
            <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-paper-300" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M4 6l4 4 4-4" />
            </svg>
          </div>
          {posErr && <FieldError id="demo-position-err">{message(posErr)}</FieldError>}
        </div>
        {field("hotel_name", "text", "organization", { maxLength: String(LIMITS.hotel) })}

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="demo-pms" className="flex items-baseline gap-2 text-body-sm font-semibold text-paper-50">
            {labels.f.pms}
            <span className="font-normal text-paper-500">({labels.f.pmsOptional})</span>
          </label>
          <input
            id="demo-pms"
            name="pms"
            type="text"
            list="demo-pms-list"
            autoComplete="off"
            maxLength={LIMITS.pms}
            placeholder={labels.ph.pms}
            onBlur={onBlur}
            aria-invalid={pmsErr ? true : undefined}
            aria-describedby={pmsErr ? "demo-pms-err" : undefined}
            className={cn("demo-input", pmsErr && "is-invalid")}
          />
          <datalist id="demo-pms-list">
            {[...PMS_SUGGESTIONS, labels.pmsNotSure].map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          {pmsErr && <FieldError id="demo-pms-err">{message(pmsErr)}</FieldError>}
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="demo-description" className="text-body-sm font-semibold text-paper-50">
            {labels.f.description}
          </label>
          <textarea
            id="demo-description"
            name="description"
            rows={5}
            maxLength={LIMITS.descMax}
            placeholder={labels.ph.description}
            onBlur={onBlur}
            aria-invalid={descErr ? true : undefined}
            aria-describedby={descErr ? "demo-description-err" : undefined}
            className={cn("demo-input resize-y", descErr && "is-invalid")}
          />
          <div className="flex items-start justify-between gap-4">
            {descErr ? <FieldError id="demo-description-err">{message(descErr)}</FieldError> : <span />}
            <span aria-hidden className="shrink-0 text-body-sm text-paper-500 tabular-nums">
              {labels.chars.replace("{count}", String(descLen)).replace("{max}", String(LIMITS.descMax))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <input
            id="demo-consent"
            name="consent"
            type="checkbox"
            onBlur={onBlur}
            aria-invalid={consentErr ? true : undefined}
            aria-describedby={consentErr ? "demo-consent-err" : undefined}
            className="demo-check mt-0.5"
          />
          <label htmlFor="demo-consent" className="text-body-sm text-paper-300 [&_a]:text-holo-300 [&_a]:underline [&_a]:underline-offset-4">
            {consentLabel}
          </label>
        </div>
        {consentErr && <FieldError id="demo-consent-err">{message(consentErr)}</FieldError>}
      </div>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending || undefined}
        className="btn-cta magnetic group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill px-7 py-3 text-[0.9375rem] font-semibold disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:self-start"
      >
        {pending ? (
          <>
            <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-ink-900/25 border-t-ink-900" />
            {labels.sending}
          </>
        ) : (
          <>
            {labels.submit}
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-center gap-1.5 text-body-sm text-danger-night">
      <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 4.8v3.6M8 10.8v.4" strokeLinecap="round" />
      </svg>
      {children}
    </p>
  );
}
