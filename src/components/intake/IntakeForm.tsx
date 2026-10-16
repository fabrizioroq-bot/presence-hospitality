"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { intakeOpen, intakeSubmit } from "./api";
import { IntakeButton as Button } from "./ui";
import type { IntakeDoc, IntakeLang } from "@/content/onboarding-form";
import { intakeProgress, missingRequired, type Answers } from "@/lib/intake/answers";
import { fill, todayIso, type IntakeStrings } from "@/lib/intake/format";
import { IntakeGroupView, IntakeItems, fieldId, type FieldContext } from "./IntakeFields";
import { IntakeReview } from "./IntakeReview";
import { IntakeStepBar, type StepChip } from "./IntakeStepBar";
import { clearDraft, readDraft, useIntakeAutosave } from "./useIntakeAutosave";

type Props = {
  logo: ReactNode;
  token: string;
  lang: IntakeLang;
  doc: IntakeDoc;
  initialAnswers: Answers;
  /** When the server copy was last saved (ISO); a newer unsynced local draft wins. */
  serverUpdatedAt: string | null;
  initialStep: number;
  langHrefs: Record<IntakeLang, string>;
  privacyHref: string;
  strings: IntakeStrings;
};

const hasValue = (v: unknown) => v !== undefined && v !== "" && v !== false;

/** Answers to start from: the server copy, a newer local draft, and today's date if none is set. */
function startingAnswers(token: string, server: Answers, serverUpdatedAt: string | null) {
  const withDate = (a: Answers) => (hasValue(a["id.date"]) ? a : { ...a, "id.date": todayIso() });
  const draft = readDraft(token);
  const useDraft = Boolean(draft && !draft.synced && (!serverUpdatedAt || draft.at > serverUpdatedAt));
  const answers = withDate(useDraft && draft ? draft.answers : server);
  // Only mention the restore when the draft holds more than the server copy plus today's date.
  const restored = useDraft && JSON.stringify(sorted(answers)) !== JSON.stringify(sorted(withDate(server)));
  return { answers, restored };
}

const sorted = (a: Answers) => Object.fromEntries(Object.entries(a).sort(([x], [y]) => x.localeCompare(y)));

export function IntakeForm({ logo, token, lang, doc, initialAnswers, serverUpdatedAt, initialStep, langHrefs, privacyHref, strings }: Props) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [isRestored, setIsRestored] = useState(false);
  const [step, setStep] = useState(initialStep);
  const [errors, setErrors] = useState<ReadonlyMap<string, string>>(new Map());
  const heading = useRef<HTMLHeadingElement>(null);
  const isMounted = useRef(false);

  // Expired, revoked or submitted meanwhile: reload so the server shows the right screen.
  const lockAndReload = useCallback(() => window.location.reload(), []);
  const status = useIntakeAutosave(token, answers, lockAndReload);

  // Browser-only start: local draft, today's date, and "opened" (not on GET, so previews don't count).
  useEffect(() => {
    const start = startingAnswers(token, initialAnswers, serverUpdatedAt);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage only exists after hydration
    if (start.answers !== initialAnswers) setAnswers(start.answers);
    setIsRestored(start.restored);
    intakeOpen(token)
      .then((r) => r.status !== "ok" && r.status !== "error" && lockAndReload())
      .catch(() => {
        // Offline on arrival: the autosave retries once the connection is back.
      });
  }, [token, initialAnswers, serverUpdatedAt, lockAndReload]);

  // Move focus to the new step's heading (keyboard and screen-reader users), but not on first load.
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  const onChange = useCallback((key: string, value: string | boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const progress = intakeProgress(answers);
  const lastStep = doc.sections.length + 1;
  const steps: StepChip[] = useMemo(
    () => [
      { label: strings.start, name: strings.start, isDone: missingRequired(answers).length === 0 },
      ...doc.sections.map((s, i) => ({
        label: String(i + 1).padStart(2, "0"),
        name: s.title,
        isDone: s.groups.some((g) => g.items.some((it) => hasValue(answers[it.key]))),
      })),
      { label: "✓", name: strings.review, isDone: false },
    ],
    [answers, doc.sections, strings.start, strings.review],
  );

  const ctx: FieldContext = { lang, answers, onChange, errors, strings };

  /** Called by the review step when the server (or the check before it) finds missing details. */
  const showMissing = useCallback(
    (keys: readonly string[]) => {
      setErrors(new Map(keys.map((k) => [k, k === "id.email" && hasValue(answers[k]) ? strings.invalidEmail : strings.required])));
      setStep(0);
      requestAnimationFrame(() => document.getElementById(fieldId(keys[0]))?.focus());
    },
    [answers, strings.invalidEmail, strings.required],
  );

  const submit = useCallback(async () => {
    const res = await intakeSubmit(token, answers);
    if (res.status === "ok" || res.status === "submitted") {
      clearDraft(token);
      window.location.reload();
      return "ok" as const;
    }
    if (res.missing?.length) {
      showMissing(res.missing);
      return "missing" as const;
    }
    if (res.status === "expired" || res.status === "revoked" || res.status === "not_found") {
      window.location.reload();
      return "ok" as const;
    }
    return "error" as const;
  }, [token, answers, showMissing]);

  const section = step >= 1 && step <= doc.sections.length ? doc.sections[step - 1] : null;

  return (
    <>
      <a href="#intake-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-pill focus:bg-(--ph-bg-surface) focus:px-4 focus:py-2">
        {strings.skip}
      </a>
      <IntakeStepBar logo={logo} steps={steps} current={step} onGo={setStep} progress={progress} status={status} lang={lang} langHrefs={withStep(langHrefs, step)} strings={strings} />
      <main id="intake-main" lang={lang} className="mx-auto max-w-5xl px-4 pt-8 pb-24 sm:px-8 lg:pt-12">
        <p className="mb-6 text-body-sm text-(--ph-text-muted) tabular-nums">{fill(strings.stepOf, { n: step + 1, total: lastStep + 1 })}</p>

        {step === 0 && (
          <div className="flex flex-col gap-8">
            <div className="flex max-w-[68ch] flex-col gap-4">
              <h1 ref={heading} tabIndex={-1} className="text-display-lg text-(--ph-brand-primary) outline-none">
                {doc.title}
              </h1>
              {doc.intro.map((p) => (
                <p key={p} className="text-body-lg text-(--ph-text-secondary)">
                  {p}
                </p>
              ))}
            </div>
            {isRestored && (
              <p role="status" className="rounded-md border border-(--ph-border-subtle) bg-(--ph-bg-surface) p-3 text-body-sm text-(--ph-text-secondary)">
                {strings.restored}
              </p>
            )}
            <div className="ui-card p-5 sm:p-8">
              <IntakeItems items={doc.ident} ctx={{ ...ctx, required: true }} />
            </div>
            <p className="max-w-[68ch] text-body-sm text-(--ph-text-muted)">
              {strings.privacy}{" "}
              <a href={privacyHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-(--ph-brand-primary) underline underline-offset-4">
                {strings.privacyLink}
              </a>
            </p>
          </div>
        )}

        {section && (
          <div className="flex flex-col gap-8">
            <div className="flex max-w-[68ch] flex-col gap-3">
              {section.part && <p className="text-label text-(--ph-text-muted)">{section.part}</p>}
              <h2 ref={heading} tabIndex={-1} className="text-heading-md text-(--ph-brand-primary) outline-none">
                {section.title}
              </h2>
              {section.desc && <p className="text-body text-(--ph-text-secondary)">{section.desc}</p>}
            </div>
            <div className="ui-card flex flex-col gap-10 p-5 sm:p-8">
              {section.groups.map((g, i) => (
                <IntakeGroupView key={`${section.id}-${i}`} group={g} ctx={ctx} />
              ))}
            </div>
          </div>
        )}

        {step === lastStep && (
          <IntakeReview doc={doc} answers={answers} strings={strings} headingRef={heading} onGo={setStep} onMissing={showMissing} onSubmit={submit} />
        )}

        <nav className="mt-10 flex items-center justify-between gap-4">
          {step > 0 ? (
            <Button variant="ghost" type="button" onClick={() => setStep(step - 1)}>
              {strings.back}
            </Button>
          ) : (
            <span />
          )}
          {step < lastStep && (
            <Button type="button" arrow onClick={() => setStep(step + 1)}>
              {strings.next}
            </Button>
          )}
        </nav>
      </main>
    </>
  );
}

/** Language links keep the current step, so switching language doesn't send the client back to the start. */
const withStep = (hrefs: Record<IntakeLang, string>, step: number) =>
  Object.fromEntries(Object.entries(hrefs).map(([l, h]) => [l, `${h}&step=${step}`])) as Record<IntakeLang, string>;
