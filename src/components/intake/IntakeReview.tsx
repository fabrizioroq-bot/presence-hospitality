"use client";

import { useState, type RefObject } from "react";
import { IntakeButton as Button } from "./ui";
import type { IntakeDoc } from "@/content/onboarding-form";
import { countAnswered, missingRequired, type Answers } from "@/lib/intake/answers";
import { fill, type IntakeStrings } from "@/lib/intake/format";

type Outcome = "ok" | "missing" | "error";

/** Last step: answered count per section (each one links back), then submit with a confirmation. */
export function IntakeReview({
  doc,
  answers,
  strings,
  headingRef,
  onGo,
  onMissing,
  onSubmit,
}: {
  doc: IntakeDoc;
  answers: Answers;
  strings: IntakeStrings;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onGo: (step: number) => void;
  onMissing: (keys: readonly string[]) => void;
  onSubmit: () => Promise<Outcome>;
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const missing = missingRequired(answers);

  const send = async () => {
    setIsSending(true);
    setHasError(false);
    try {
      const outcome = await onSubmit();
      if (outcome === "error") setHasError(true);
    } catch {
      setHasError(true);
    } finally {
      setIsSending(false);
    }
  };

  const rows = [
    { step: 0, title: strings.start, keys: doc.ident.map((i) => i.key) },
    ...doc.sections.map((s, i) => ({
      step: i + 1,
      title: s.title,
      keys: s.groups.flatMap((g) => g.items.map((it) => it.key)),
    })),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex max-w-[68ch] flex-col gap-3">
        <h2 ref={headingRef} tabIndex={-1} className="text-display-lg text-(--ph-brand-primary) outline-none">
          {strings.reviewTitle}
        </h2>
        <p className="text-body-lg text-(--ph-text-secondary)">{strings.reviewLead}</p>
      </div>

      <ul className="ui-card divide-y divide-(--ph-border-subtle) p-2 sm:p-3">
        {rows.map((r) => (
          <li key={r.step}>
            <button
              type="button"
              onClick={() => onGo(r.step)}
              className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-1 rounded-md px-3 py-3.5 text-left hover:bg-(--ph-bg-page)"
            >
              <span className="text-body font-semibold text-(--ph-text-primary)">{r.title}</span>
              <span className="text-body-sm text-(--ph-text-muted) tabular-nums">
                {fill(strings.answered, { answered: countAnswered(r.keys, answers), total: r.keys.length })}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {missing.length > 0 ? (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-(--ph-error) bg-(--ph-bg-surface) p-5">
          <p className="text-body text-(--ph-text-primary)">{strings.requiredHint}</p>
          <ul className="list-disc pl-5 text-body-sm text-(--ph-text-secondary)">
            {missing.map((k) => (
              <li key={k}>{doc.ident.find((i) => i.key === k)?.label}</li>
            ))}
          </ul>
          <Button variant="ghost" type="button" onClick={() => onMissing(missing)}>
            {strings.start}
          </Button>
        </div>
      ) : isConfirming ? (
        <div role="alertdialog" aria-labelledby="intake-confirm-title" aria-describedby="intake-confirm-body" className="ui-card flex flex-col gap-4 p-5 sm:p-8">
          <h3 id="intake-confirm-title" className="text-heading-md text-(--ph-brand-primary)">
            {strings.confirmTitle}
          </h3>
          <p id="intake-confirm-body" className="text-body text-(--ph-text-secondary)">
            {strings.confirmBody}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" disabled={isSending} onClick={() => void send()}>
              {isSending ? strings.submitting : strings.confirmYes}
            </Button>
            <Button variant="ghost" type="button" disabled={isSending} onClick={() => setIsConfirming(false)}>
              {strings.confirmNo}
            </Button>
          </div>
          {hasError && (
            <p role="alert" className="text-body-sm text-(--ph-error)">
              {strings.submitError}
            </p>
          )}
        </div>
      ) : (
        <div>
          <Button type="button" arrow onClick={() => setIsConfirming(true)}>
            {strings.submit}
          </Button>
        </div>
      )}
    </div>
  );
}
