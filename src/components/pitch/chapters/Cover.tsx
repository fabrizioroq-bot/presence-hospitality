import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { claims } from "@/content/claims";
import { Chip } from "@/components/ui/Labels";
import { Footnote, Stat } from "@/components/ui/Stat";
import { SlideHeadline } from "../SlideHeadline";
import { StepCount } from "../StepCount";

const CHAPTER = 0;
const LONG_TITLE = 34; // characters, without the <em> markup
const delay = (ms: number): CSSProperties => ({ "--d": `${ms}ms` }) as CSSProperties;
const order = (i: number): CSSProperties => ({ "--i": i }) as CSSProperties;

/**
 * Chapter 1. Build 1: the headline assembles, then the subline and chips (the Holobox slides in and
 * powers on in the WebGL stage). Build 2: the three key figures and the savings footnote.
 */
export async function Cover({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "pitch" });
  const { coverage, savings, oneTap } = claims;
  const showSavings = savings.enabled && savings.range;
  // A long headline (e.g. Dutch) steps down to title size so three lines still clear the header.
  const title = t.raw("cover.title") as string;
  const isLong = title.replace(/<[^>]+>/g, "").length > LONG_TITLE;

  return (
    <div className="flex h-full max-w-[64%] flex-col justify-end gap-[calc(var(--slide-u)*3.4)]">
      <div className="flex flex-col gap-[calc(var(--slide-u)*2)]">
        <SlideHeadline as="h1" raw={title} className={isLong ? "text-slide-title" : "text-slide-hero"} />
        <p data-build="0" style={delay(560)} className="max-w-[34ch] text-slide-lead text-ui-ink-2">
          {t("cover.sub")}
        </p>
        <ul data-build="0" style={delay(760)} className="flex flex-wrap gap-2">
          <li>
            <Chip dot="live" className="text-slide-small">
              {t("cover.chips.live")}
            </Chip>
          </li>
          {coverage.enabled && (
            <li>
              <Chip dot="accent" className="text-slide-small">
                {coverage[locale]}
              </Chip>
            </li>
          )}
          <li>
            <Chip className="text-slide-small">{t("cover.chips.people")}</Chip>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-[calc(var(--slide-u)*1.6)]">
        <div className="grid grid-cols-3 gap-[calc(var(--slide-u)*2.4)]">
          {coverage.enabled && (
            <div data-build="1" style={order(0)}>
              <Stat size="slide" value={coverage[locale]} label={t("cover.stats.coverage")} />
            </div>
          )}
          {showSavings && (
            <div data-build="1" style={order(1)}>
              <Stat
                size="slide"
                mark="*"
                label={t("cover.stats.savings")}
                value={
                  <>
                    <StepCount to={savings.range![0]} chapter={CHAPTER} step={1} />–
                    <StepCount to={savings.range![1]} chapter={CHAPTER} step={1} />%
                  </>
                }
              />
            </div>
          )}
          {oneTap.enabled && (
            <div data-build="1" style={order(2)}>
              <Stat size="slide" value={oneTap[locale]} label={t("cover.stats.oneTap")} />
            </div>
          )}
        </div>
        {showSavings && (
          <div data-build="1" style={order(3)}>
            <Footnote mark="*" className="text-slide-small">
              {t("footnotes.savings")}
            </Footnote>
          </div>
        )}
      </div>
    </div>
  );
}
