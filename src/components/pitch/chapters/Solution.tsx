import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { claims } from "@/content/claims";
import { Card, CardColumns } from "@/components/ui/Card";
import { Chip, NumberBadge } from "@/components/ui/Labels";
import { Footnote, Stat } from "@/components/ui/Stat";
import { CompareSlider, type CompareStrings } from "../CompareSlider";
import { SlideHeadline } from "../SlideHeadline";
import { StepCount } from "../StepCount";

const CHAPTER = 2;
const PILLARS = ["experience", "cost", "scale"] as const;
const order = (i: number): CSSProperties => ({ "--i": i }) as CSSProperties;

/**
 * Chapter 3. Build 1: the empty traditional desk (slider left). Build 2: the slider wipes to the
 * Holobox and 40–65% counts up. Build 3: the slider and figure give way to the three pillars.
 */
export async function Solution({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "pitch" });
  const { savings } = claims;
  const figure = savings.enabled && savings.range ? `${savings.range[0]}–${savings.range[1]}%*` : null;
  const body = (id: (typeof PILLARS)[number]) =>
    id === "cost" ? (figure ? t("solution.pillars.cost.body", { savings: figure }) : t("solution.pillars.cost.bodyNoFigure")) : t(`solution.pillars.${id}.body`);

  return (
    <div className="relative h-full">
      <div className="flex max-w-[42%] flex-col gap-[calc(var(--slide-u)*2.6)]">
        <SlideHeadline raw={t.raw("solution.title")} className="text-slide-title" />
        <div data-build="0" data-hide-from="2" style={{ "--d": "400ms" } as CSSProperties}>
          <CompareSlider strings={t.raw("solution.compare") as CompareStrings} chapter={CHAPTER} />
        </div>
        {figure && savings.range && (
          <div data-build="1" data-hide-from="2" className="flex flex-col gap-[calc(var(--slide-u)*1.2)]">
            <Stat
              size="slide"
              mark="*"
              label={t("solution.savings")}
              value={
                <>
                  <StepCount to={savings.range[0]} chapter={CHAPTER} step={1} />–
                  <StepCount to={savings.range[1]} chapter={CHAPTER} step={1} />%
                </>
              }
            />
            <Footnote mark="*" className="text-slide-small">
              {t("footnotes.savings")}
            </Footnote>
          </div>
        )}
      </div>

      <div data-build="2" className="absolute inset-x-0 bottom-0 flex flex-col gap-[calc(var(--slide-u)*1.2)]">
        <Card>
          <CardColumns>
            {PILLARS.map((id, i) => (
              <div key={id} data-build="2" style={order(i + 1)} className="flex flex-col gap-[calc(var(--slide-u)*1)] p-[calc(var(--slide-u)*2)]">
                <NumberBadge n={i + 1} size="sm" />
                <h3 className="text-slide-h3">{t(`solution.pillars.${id}.title`)}</h3>
                <p className="text-slide-small text-ui-ink-2">{body(id)}</p>
                {id === "scale" && (
                  <ul aria-label={t("solution.integrationsLabel")} className="flex flex-wrap gap-2">
                    {(t.raw("solution.integrations") as string[]).map((name) => (
                      <li key={name}>
                        <Chip className="text-slide-small">{name}</Chip>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CardColumns>
        </Card>
        {figure && (
          <Footnote mark="*" className="text-slide-small">
            {t("footnotes.savings")}
          </Footnote>
        )}
      </div>
    </div>
  );
}
