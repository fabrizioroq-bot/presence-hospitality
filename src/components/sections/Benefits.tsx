import { getLocale, getTranslations } from "next-intl/server";
import { AmbientDust } from "@/components/ambient/AmbientDust";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { HologramPoster } from "@/components/hologram/HologramPoster";
import { Bars } from "@/components/ui/Bars";
import { Depth } from "@/components/ui/Depth";
import { Headline } from "@/components/ui/Headline";
import { RangeTicker } from "@/components/ui/RangeTicker";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { SwipeDots } from "@/components/ui/SwipeDots";
import { claims } from "@/content/claims";
import { cn } from "@/lib/cn";

const tile = "flex h-full flex-col gap-4 rounded-xl p-7 lg:p-10";

/** Our solution: asymmetric bento (A dominant, B ink, C gradient, D/E outlined). Mist. */
export async function Benefits() {
  const t = await getTranslations("benefits");
  const c = await getTranslations("common");
  const locale = (await getLocale()) as "en" | "nl";
  const savings = claims.savings;
  const showSavings = savings.enabled && savings.range;

  return (
    <section
      id="benefits"
      data-mood="mist"
      aria-labelledby="benefits-title"
      className="relative isolate overflow-hidden bg-mist-bg pt-4 pb-16 text-ink-900 lg:pt-8 lg:pb-32"
    >
      <ParallaxOrbs
        orbs={[
          { color: "mint", size: "min(50vw, 700px)", top: "10%", right: "-16%", opacity: 0.5, dur: 24 },
          { color: "lavender", size: "min(40vw, 560px)", bottom: "0%", left: "-14%", opacity: 0.5, dur: 21 },
          { color: "sky", size: "min(30vw, 420px)", top: "45%", left: "35%", opacity: 0.3, dur: 26 },
        ]}
      />
      <AmbientDust mood="mist" density={0.45} />

      <div className="container-site">
        <div className="flex flex-col gap-6">
          <p className="text-label text-ink-700">{t("eyebrow")}</p>
          <Headline id="benefits-title" raw={t.raw("title") as string} className="max-w-[18ch] text-display-xl" />
        </div>

        <RevealGroup id="solution-benefits" tabIndex={0} className="swipe-row mt-10 lg:mt-16 lg:grid lg:grid-cols-12 lg:grid-rows-[auto_auto_auto] lg:gap-6" gap={0.09}>
          {/* A — dominant, with a small live Holobox (from sm: on phones it would stretch every card in the swipe row) */}
          <RevealItem className="swipe-item lg:col-span-7 lg:row-span-2">
            <Depth range={20} className="h-full">
              <SpotlightCard tone="ink" className={cn(tile, "justify-between border border-line-mist bg-mist-surface/80 lg:flex-row lg:gap-10")}>
                <div className="flex flex-col gap-4 lg:max-w-[30ch] lg:self-end">
                  <h3 className="text-display-lg">{t("aTitle")}</h3>
                  <p className="text-body-lg text-ink-700">{t("aBody")}</p>
                </div>
                <div aria-hidden className="relative mx-auto hidden aspect-[3/4.4] w-44 shrink-0 overflow-hidden rounded-lg bg-night-900 sm:block sm:w-52 lg:mx-0 lg:w-60">
                  <div className="absolute inset-x-0 top-[8%] bottom-[4%]">
                    <HologramPoster />
                  </div>
                  <div className="scan-sweep" />
                  <span className="live-dot absolute top-4 left-4" />
                </div>
              </SpotlightCard>
            </Depth>
          </RevealItem>

          {/* B — cost, ink tile */}
          <RevealItem className="swipe-item lg:col-span-5">
            <div className={cn(tile, "bg-petrol text-paper-50")}>
              <h3 className="text-heading-md">{t("bTitle")}</h3>
              {showSavings ? (
                <p className="flex flex-col gap-2">
                  <span className="text-label text-paper-300">{t("bUpTo")}</span>
                  <span className="text-display-lg lg:text-display-xl">
                    <RangeTicker className="key-figure" from={savings.range![0]} to={savings.range![1]} />
                    <sup aria-hidden className="ml-1 align-super text-body text-accent-night">
                      ¹
                    </sup>
                  </span>
                  <span className="text-body-lg text-paper-300">{t("bSuffix")}</span>
                </p>
              ) : (
                <p className="text-body-lg text-paper-300">{t("bFallback")}</p>
              )}
            </div>
          </RevealItem>

          {/* C — 24/7, holo gradient */}
          <RevealItem className="swipe-item lg:col-span-5">
            <div className={cn(tile, "bg-holo-gradient text-ink-900")}>
              <span className="key-figure text-display-lg lg:text-display-xl">{claims.coverage[locale]}</span>
              <p className="max-w-[32ch] text-body-lg text-ink-700">{t("cBody")}</p>
            </div>
          </RevealItem>

          {/* D — scalable */}
          <RevealItem className="swipe-item lg:col-span-5">
            <div className={cn(tile, "border border-line-mist")}>
              <h3 className="text-heading-md">{t("dTitle")}</h3>
              <p className="text-body text-ink-700">{t("dBody")}</p>
            </div>
          </RevealItem>

          {/* E — predictable cost, with the fee inputs */}
          <RevealItem className="swipe-item lg:col-span-7">
            <div className={cn(tile, "border border-line-mist lg:grid lg:grid-cols-2 lg:items-end lg:gap-10")}>
              <div className="flex flex-col gap-4">
                <h3 className="text-heading-md">{t("eTitle")}</h3>
                <p className="text-body text-ink-700">{t("eBody")}</p>
              </div>
              <div className="mt-4 lg:mt-0">
                <Bars
                  items={[
                    { label: t("eRooms"), value: 0.78 },
                    { label: t("eHours"), value: 0.55 },
                    { label: t("eVolume"), value: 0.4 },
                  ]}
                />
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
        <SwipeDots target="solution-benefits" count={5} label={c("swipeHint")} />

        {showSavings && (
          <p id="benefits-footnote" className="mt-6 max-w-[80ch] text-body-sm text-ink-500">
            ¹ {t("footnote")}
          </p>
        )}
      </div>
    </section>
  );
}
