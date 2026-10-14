import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { DemandSweep, type DemandSweepStrings } from "../DemandSweep";
import { SlideHeadline } from "../SlideHeadline";

const CHAPTER = 1;
const PILLARS = ["cost", "staffing", "fragmentation"] as const;
const order = (i: number): CSSProperties => ({ "--i": i }) as CSSProperties;

/**
 * Chapter 2 (charcoal). Build 1: title + intro. Build 2: the 24-hour chart sweeps. Build 3: the intro
 * gives way to the three pillars (same column, so nothing jumps).
 */
export async function Problem({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "pitch.problem" });
  const chart = t.raw("chart") as DemandSweepStrings;
  return (
    <div className="grid h-full grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-end gap-[calc(var(--slide-u)*5)]">
      <div className="flex flex-col gap-[calc(var(--slide-u)*2.4)]">
        <SlideHeadline raw={t.raw("title")} className="text-slide-title" />
        <div className="grid">
          <p data-build="0" data-hide-from="2" style={{ "--d": "500ms" } as CSSProperties} className="col-start-1 row-start-1 max-w-[46ch] text-slide-body text-ui-ink-2">
            {t("intro")}
          </p>
          <ol className="col-start-1 row-start-1 flex flex-col gap-[calc(var(--slide-u)*1.8)]">
            {PILLARS.map((id, i) => (
              <li key={id} data-build="2" style={order(i)} className="flex flex-col gap-[calc(var(--slide-u)*0.6)]">
                <h3 className="flex items-center gap-3 text-slide-h3 uppercase">
                  <span aria-hidden className="ui-dot h-[0.6em] w-[0.6em]" />
                  {t(`pillars.${id}.title`)}
                </h3>
                <p className="max-w-[52ch] text-slide-small text-ui-ink-2">{t(`pillars.${id}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div data-build="1">
        <DemandSweep strings={chart} chapter={CHAPTER} step={1} />
      </div>
    </div>
  );
}
