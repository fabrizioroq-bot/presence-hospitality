import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { Card, CardColumns } from "@/components/ui/Card";
import { Chip, NumberBadge, Pill } from "@/components/ui/Labels";
import { SlideHeadline } from "../SlideHeadline";

const COLUMNS = ["setup", "monthly", "variable"] as const;
const STEPS = ["intake", "install", "integration", "golive"] as const;
/** Onboarding nodes light up as the line fills (pitch.css .pitch-timeline). */
const NODE_MS = 650;

/**
 * Chapter 7. Build 1: the price structure as an equation (no figures) and the early-adopter offer.
 * Build 2: the four onboarding steps light up along the line; the handover promise closes it.
 */
export async function Pricing() {
  const t = await getTranslations({ locale: "en", namespace: "pitch.pricing" });
  return (
    <div className="flex h-full flex-col gap-[calc(var(--slide-u)*2.6)]">
      <div className="grid">
        <div data-hide-from="1" className="col-start-1 row-start-1">
          <SlideHeadline raw={t.raw("title")} className="text-slide-title" />
        </div>
        <div className="col-start-1 row-start-1">
          <SlideHeadline raw={t.raw("onboardingTitle")} build={1} className="text-slide-title" />
        </div>
      </div>

      <div className="grid flex-1">
        <div data-hide-from="1" className="col-start-1 row-start-1 flex flex-col gap-[calc(var(--slide-u)*2.4)] self-start">
          <Card data-build="0" style={{ "--d": "300ms" } as CSSProperties}>
            <CardColumns>
              {COLUMNS.map((id, i) => {
                const points = t.raw(`columns.${id}.points`) as string[];
                return (
                  <div key={id} className="relative flex flex-col gap-[calc(var(--slide-u)*1)] p-[calc(var(--slide-u)*2.2)]">
                    {i > 0 && (
                      <span aria-hidden className="ui-num absolute top-[calc(var(--slide-u)*2)] -left-[1.15rem] h-9 w-9 text-[1.25rem]">
                        +
                      </span>
                    )}
                    <h3 className="flex flex-wrap items-center gap-3 text-slide-h3">
                      {t(`columns.${id}.title`)}
                      {id === "variable" && <Chip className="text-slide-small">{t("columns.variable.tag")}</Chip>}
                    </h3>
                    {id === "monthly" && <p className="text-slide-body font-semibold">{t("columns.monthly.lead")}</p>}
                    <ul className="flex list-disc flex-col gap-1 pl-5 text-slide-body text-ui-ink-2">
                      {points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </CardColumns>
          </Card>
          <div data-build="0" style={{ "--d": "800ms" } as CSSProperties}>
            <Pill size="lg">{t("cta")}</Pill>
          </div>
        </div>

        <div className="col-start-1 row-start-1 flex flex-col gap-[calc(var(--slide-u)*3.4)] self-start">
          <ol data-build="1" className="pitch-timeline relative grid grid-cols-4 gap-[calc(var(--slide-u)*2)] pt-[calc(var(--slide-u)*0.4)]">
            <span aria-hidden className="pitch-timeline-track" />
            <span aria-hidden className="pitch-timeline-fill" />
            {STEPS.map((id, i) => (
              <li key={id} data-node style={{ "--d": `${300 + i * NODE_MS}ms` } as CSSProperties} className="relative flex flex-col gap-[calc(var(--slide-u)*1)]">
                <NumberBadge n={i + 1} size="lg" />
                <h3 className="text-slide-h3">{t(`steps.${id}.title`)}</h3>
                <p className="text-slide-body text-ui-ink-2">{t(`steps.${id}.detail`)}</p>
              </li>
            ))}
          </ol>
          <p data-build="1" style={{ "--d": `${300 + STEPS.length * NODE_MS + 200}ms` } as CSSProperties} className="flex items-center gap-3 text-slide-h3">
            <svg aria-hidden viewBox="0 0 24 24" className="h-[1.1em] w-[1.1em] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
            {t("handover")}
          </p>
        </div>
      </div>
    </div>
  );
}
