import { getLocale, getTranslations } from "next-intl/server";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { Headline } from "@/components/ui/Headline";
import { RangeTicker } from "@/components/ui/RangeTicker";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SwipeDots } from "@/components/ui/SwipeDots";
import { claims } from "@/content/claims";
import { pagePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

const tile = "swipe-item flex h-full flex-col gap-4 rounded-xl p-7 lg:p-10";

/** Home: three key benefits (swipe row on mobile) + link to the full solution. Mist. */
export async function KeyBenefits() {
  const t = await getTranslations("benefits");
  const k = await getTranslations("keyBenefits");
  const c = await getTranslations("common");
  const locale = (await getLocale()) as Locale;
  const savings = claims.savings;
  const showSavings = savings.enabled && savings.range;
  return (
    <section id="benefits" data-mood="mist" data-tone="lavender" aria-labelledby="key-benefits-title" className="relative isolate overflow-hidden bg-mist-bg pt-4 pb-16 text-ink-900 lg:pt-8 lg:pb-32">
      <ParallaxOrbs
        orbs={[
          { color: "mint", size: "min(50vw, 700px)", top: "10%", right: "-16%", opacity: 0.5, dur: 24 },
          { color: "lavender", size: "min(40vw, 560px)", bottom: "0%", left: "-14%", opacity: 0.5, dur: 21 },
        ]}
      />
      <div className="container-site">
        <div className="flex flex-col gap-5">
          <p className="text-label text-ink-700">{k("eyebrow")}</p>
          <Headline id="key-benefits-title" raw={k.raw("title") as string} className="max-w-[16ch] text-display-xl" />
        </div>
        <RevealGroup id="key-benefits" tabIndex={0} className="swipe-row mt-8 lg:mt-14 lg:grid lg:grid-cols-3 lg:gap-6" gap={0.09}>
          <RevealItem className={cn(tile, "bg-ink-900 text-paper-50")}>
            <h3 className="text-heading-md">{t("bTitle")}</h3>
            {showSavings ? (
              <p className="flex flex-col gap-2">
                <span className="text-label text-paper-300">{t("bUpTo")}</span>
                <span className="text-display-lg">
                  <RangeTicker className="key-figure" from={savings.range![0]} to={savings.range![1]} />
                  <sup aria-hidden className="ml-1 align-super text-body text-holo-300">¹</sup>
                </span>
                <span className="text-body text-paper-300">{t("bSuffix")}</span>
              </p>
            ) : (
              <p className="text-body text-paper-300">{t("bFallback")}</p>
            )}
          </RevealItem>
          <RevealItem className={cn(tile, "bg-holo-gradient text-ink-900")}>
            <span className="key-figure text-display-lg">{claims.coverage[locale]}</span>
            <p className="text-body-lg text-ink-700">{t("cBody")}</p>
          </RevealItem>
          <RevealItem className={cn(tile, "bg-mist-raised/80")}>
            <h3 className="text-heading-md">{t("eTitle")}</h3>
            <p className="text-body text-ink-700">{t("eBody")}</p>
          </RevealItem>
        </RevealGroup>
        <SwipeDots target="key-benefits" count={3} label={c("swipeHint")} />
        <div className="mt-6 flex flex-col gap-4 lg:mt-8 lg:flex-row lg:items-center lg:justify-between">
          {showSavings && <p className="max-w-[80ch] text-body-sm text-ink-500">¹ {t("footnote")}</p>}
          <a href={pagePath(locale, "/solution")} className="group inline-flex min-h-11 items-center gap-2 font-semibold text-ink-900 underline decoration-line-mist underline-offset-4 hover:decoration-ink-900">
            {k("more")}
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
