import { getTranslations } from "next-intl/server";
import { AmbientDust } from "@/components/ambient/AmbientDust";
import { LightSweep } from "@/components/ambient/LightSweep";
import { MoodTransition } from "@/components/ambient/MoodTransition";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { HoloStage } from "@/components/hologram/HoloStage";
import { Depth } from "@/components/ui/Depth";
import { Headline } from "@/components/ui/Headline";
import { NumberRoll } from "@/components/ui/NumberRoll";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { cn } from "@/lib/cn";

const showMedia = process.env.SHOW_MEDIA_PLACEHOLDERS === "true";

/** The holographic experience (Holobox stage) + Behind the box. Deep night section. */
export async function Experience() {
  const t = await getTranslations("experience");
  const b = await getTranslations("behind");
  const facts = [
    { label: t("fFormatLabel"), text: t("fFormat") },
    { label: t("fLiveLabel"), text: t("fLive") },
    { label: t("fLangLabel"), text: t("fLang") },
  ];
  const cards = [1, 2, 3, 4, 5].map((i) => ({
    n: i,
    title: b(`c${i}Title` as "c1Title"),
    body: b(`c${i}Body` as "c1Body"),
    filled: i === 1 || i === 4, // pitch slide 6: 01 and 04 carry the holo gradient
  }));

  return (
    <>
      <MoodTransition from="mist" to="deep" />
      <section
        id="experience"
        data-mood="night"
        aria-labelledby="experience-title"
        className="relative isolate overflow-hidden bg-night-900 text-paper-50"
      >
        <ParallaxOrbs
          range={80}
          orbs={[
            { color: "sky", size: "min(60vw, 820px)", top: "-8%", right: "-20%", opacity: 0.16, dur: 24 },
            { color: "lavender", size: "min(40vw, 560px)", top: "45%", left: "-12%", opacity: 0.1, dur: 22 },
            { color: "peach", size: "min(26vw, 360px)", bottom: "4%", right: "20%", opacity: 0.1, dur: 26 },
          ]}
        />
        <LightSweep />
        <AmbientDust mood="night" density={0.6} />

        {/* ---------------- Part A: the stage ---------------- */}
        <div className="container-site pt-8 lg:pt-16">
          <div className="relative">
            <HoloStage
              className="aspect-[3/4] w-full sm:aspect-[4/3] lg:aspect-auto lg:h-[min(80svh,760px)]"
              hud={{ online: t("hudOnline"), route: t("hudRoute"), live: t("hudLive") }}
              alt={t("stageAlt")}
              dragHint={t("drag")}
            />
            <div className="mt-10 flex max-w-xl flex-col gap-6 lg:pointer-events-none lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:p-12">
              <p className="text-label text-paper-500">{t("eyebrow")}</p>
              <Headline id="experience-title" raw={t.raw("title") as string} className="text-display-xl" />
              <Reveal>
                <p className="max-w-[46ch] text-body-lg text-paper-300">{t("body")}</p>
              </Reveal>
            </div>
          </div>

          <Depth range={24}>
            <RevealGroup className="mt-12 grid border-y border-line-night/60 sm:grid-cols-3 lg:mt-16" gap={0.08}>
              {facts.map((f, i) => (
                <RevealItem
                  key={f.label}
                  className={cn(
                    "flex flex-col gap-3 py-8 sm:px-8",
                    i > 0 && "border-t border-line-night/60 sm:border-t-0 sm:border-l",
                    i === 0 && "sm:pl-0",
                  )}
                >
                  <span className="text-label text-holo-300">{f.label}</span>
                  <p className="text-body-lg text-paper-50">{f.text}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </Depth>

          {/* TODO(media): real Holobox footage. Hidden unless SHOW_MEDIA_PLACEHOLDERS=true. */}
          {showMedia && (
            <div className="mt-12 grid aspect-video place-items-center rounded-lg border border-dashed border-line-night bg-night-800 text-label text-paper-500">
              {t("media")}
            </div>
          )}
        </div>

        {/* ---------------- Part B: behind the box ---------------- */}
        <div className="container-site pt-24 pb-24 lg:pt-40 lg:pb-40">
          <div className="flex flex-col gap-6">
            <p className="text-label text-paper-500">{b("eyebrow")}</p>
            <Headline raw={b.raw("title") as string} className="text-display-lg" />
          </div>
          <RevealGroup className="mt-12 grid gap-6 lg:grid-cols-2" gap={0.08}>
            {cards.map((c) => (
              <RevealItem
                key={c.n}
                className={cn(c.n === 5 && "lg:col-span-2 lg:mx-auto lg:w-[calc(50%-12px)]")}
              >
                <SpotlightCard
                  tone={c.filled ? "ink" : "holo"}
                  className={cn(
                    "flex h-full items-start gap-6 rounded-xl p-6 sm:p-8",
                    c.filled ? "bg-holo-gradient text-ink-900" : "border border-line-night text-paper-50",
                  )}
                >
                  <NumberRoll
                    value={c.n}
                    className={cn(
                      "grid h-16 w-16 shrink-0 place-items-center rounded-pill font-mono text-[1.25rem] font-medium tabular-nums",
                      c.filled ? "bg-ink-900 text-paper-50" : "bg-paper-50 text-ink-900",
                    )}
                  />
                  <div className="flex flex-col gap-2 pt-1">
                    <h3 className="text-heading-md">{c.title}</h3>
                    <p className={cn("text-body", c.filled ? "text-ink-700" : "text-paper-300")}>{c.body}</p>
                  </div>
                </SpotlightCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
