import { getLocale, getTranslations } from "next-intl/server";
import { AmbientDust } from "@/components/ambient/AmbientDust";
import { LightSweep } from "@/components/ambient/LightSweep";
import { MoodTransition } from "@/components/ambient/MoodTransition";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { Depth } from "@/components/ui/Depth";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SwipeDots } from "@/components/ui/SwipeDots";
import { claims } from "@/content/claims";
import { DemandChart } from "./DemandChart";

/**
 * The problem, in brief (home): the market statement as the heading, three pillars (a swipe row on
 * mobile, the pitch's outlined panel on desktop) and the 24-hour chart. One night block.
 */
export async function MarketProblem() {
  const t = await getTranslations("market");
  const p = await getTranslations("problem");
  const c = await getTranslations("common");
  const locale = (await getLocale()) as "en" | "nl";
  const tax = claims.amsterdamTax;

  const columns = [
    { title: p("c1Title"), body: p("c1Body") },
    { title: p("c2Title"), body: p("c2Body") },
    { title: p("c3Title"), body: p("c3Body") },
  ];

  return (
    <>
      <MoodTransition from="mist" to="night" />
      <section id="problem" data-mood="night" aria-labelledby="problem-title" className="relative isolate overflow-hidden bg-charcoal-700 text-paper-50">
        <ParallaxOrbs
          range={90}
          orbs={[
            { color: "sky", size: "min(55vw, 760px)", top: "2%", right: "-18%", opacity: 0.2, dur: 24 },
            { color: "peach", size: "min(30vw, 420px)", top: "38%", left: "-8%", opacity: 0.14, dur: 26 },
            { color: "lavender", size: "min(40vw, 560px)", bottom: "-6%", right: "12%", opacity: 0.12, dur: 20 },
          ]}
        />
        <LightSweep />
        <AmbientDust mood="night" density={0.7} />

        <div className="container-site pt-6 pb-12 lg:pt-16 lg:pb-40">
          <div className="grid gap-5 lg:grid-cols-12 lg:gap-10">
            <p className="text-label text-paper-500 lg:col-span-12">{p("eyebrow")}</p>
            <Depth range={-30} lgOnly className="lg:col-span-8">
              <h2 id="problem-title" className="sr-only">
                {p("eyebrow")}
              </h2>
              <LineReveal
                className="text-display-lg max-w-[22ch] text-paper-50"
                lines={[t.raw("line1") as string, t.raw("line2") as string, t.raw("line3") as string]}
              />
            </Depth>
            <Depth range={40} lgOnly className="self-end lg:col-span-4">
              <Reveal className="flex flex-col gap-6">
                <p className="max-w-[52ch] text-body-lg text-paper-300">{t("body")}</p>
                {tax.enabled && tax.source && (
                  <div className="rounded-lg border border-line-night p-6 text-body-sm text-paper-300">
                    <p>{tax[locale]}</p>
                    <a href={tax.source} className="mt-3 inline-block text-holo-300 underline underline-offset-4">
                      {t("source")}
                    </a>
                  </div>
                )}
              </Reveal>
            </Depth>
          </div>

          {/* Pillars: swipe row on mobile, the pitch's outlined three-column panel on desktop */}
          <RevealGroup
            id="problem-pillars"
            tabIndex={0}
            className="swipe-row mt-8 lg:mt-20 lg:grid lg:grid-cols-3 lg:rounded-xl lg:border lg:border-line-night"
            gap={0.1}
          >
            {columns.map((col, i) => (
              <RevealItem
                key={col.title}
                className={
                  "swipe-item relative flex flex-col gap-3 rounded-lg border border-line-night p-6 lg:gap-5 lg:rounded-none lg:border-0 lg:px-10 lg:py-12 " +
                  (i > 0 ? "lg:before:absolute lg:before:inset-y-8 lg:before:left-0 lg:before:w-px lg:before:bg-line-night" : "")
                }
              >
                <span aria-hidden className="hidden h-5 w-5 rounded-full bg-holo-gradient shadow-glow-holo lg:block" />
                <h3 className="text-caps text-paper-50">{col.title}</h3>
                <p className="text-body-sm text-paper-300 lg:text-body">{col.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
          <div className="text-paper-300">
            <SwipeDots target="problem-pillars" count={columns.length} label={c("swipeHint")} />
          </div>

          <Depth range={30} className="mt-10 lg:mt-24">
            <DemandChart
              labels={{
                title: p("chartTitle"),
                staffed: p("chartStaffed"),
                demand: p("chartDemand"),
                idle: p("chartIdle"),
                caption: p("chartCaption"),
                desc: p("chartDesc"),
              }}
            />
          </Depth>
        </div>
      </section>
    </>
  );
}
