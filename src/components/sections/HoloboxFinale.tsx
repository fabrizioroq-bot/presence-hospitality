import { getTranslations } from "next-intl/server";
import { AmbientDust } from "@/components/ambient/AmbientDust";
import { MoodTransition } from "@/components/ambient/MoodTransition";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { HologramPoster } from "@/components/hologram/HologramPoster";
import { HoloStage } from "@/components/hologram/HoloStage";
import { EditorialPhoto } from "@/components/ui/EditorialPhoto";
import { Headline } from "@/components/ui/Headline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { photos } from "@/content/photos";

/**
 * Home 12, the final WOW, emotionally human: a guest arrives (real photo) → presses call → the
 * receptionist forms in the Holobox (the 3D stage, the site's most sophisticated effect) → the real
 * person in our hub. Human → Tech → Human.
 */
export async function HoloboxFinale() {
  const t = await getTranslations("finale");
  const e = await getTranslations("experience");
  const steps = [1, 2, 3].map((i) => ({ title: t(`s${i}` as "s1"), body: t(`s${i}Body` as "s1Body") }));
  return (
    <>
      <MoodTransition from="mist" to="deep" tone="lavender" />
      <section id="experience" data-mood="night" aria-labelledby="finale-title" className="relative isolate overflow-hidden bg-night-900 pb-16 text-paper-50 lg:pb-32">
        <ParallaxOrbs
          range={80}
          orbs={[
            { color: "sky", size: "min(60vw, 820px)", top: "10%", right: "-20%", opacity: 0.14, dur: 24 },
            { color: "lavender", size: "min(40vw, 560px)", top: "50%", left: "-12%", opacity: 0.1, dur: 22 },
          ]}
        />
        <AmbientDust mood="night" density={0.5} />
        <div className="container-site flex flex-col gap-10 pt-6 lg:gap-16 lg:pt-16">
          <div className="flex flex-col gap-5">
            <p className="text-label text-paper-500">{t("eyebrow")}</p>
            <Headline id="finale-title" raw={t.raw("title") as string} className="text-display-xl" />
            <Reveal>
              <p className="max-w-[52ch] text-body-lg text-paper-300">{e("body")}</p>
            </Reveal>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-6">
            {/* 01 · the guest: a real, warm photo before the hologram */}
            <div className="flex flex-col gap-4 lg:col-span-4">
              <EditorialPhoto
                photo={photos.finaleArrival}
                alt={t("arrivalAlt")}
                sizes="(min-width: 1024px) 30vw, 92vw"
                className="hidden aspect-[4/5] lg:block"
                position="48% 55%"
              />
            </div>
            <div className="lg:col-span-8">
              <HoloStage
                className="aspect-square w-full sm:aspect-[4/3] lg:aspect-auto lg:h-[min(72svh,680px)]"
                hud={{ online: e("hudOnline"), route: e("hudRoute"), live: e("hudLive") }}
                alt={e("stageAlt")}
                dragHint={e("drag")}
                poster={<HologramPoster />}
              />
            </div>
          </div>

          <RevealGroup as="ol" className="grid gap-6 border-t border-line-night/60 pt-8 sm:grid-cols-3" gap={0.12}>
            {steps.map((s, i) => (
              <RevealItem as="li" key={s.title} className="flex gap-4">
                <span className="step-num-dark text-label pt-1" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-heading-sm text-paper-50">{s.title}</h3>
                  <p className="text-body text-paper-300">{s.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          {/* The reveal: the person behind the hologram, working live in our hub */}
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-6">
            <EditorialPhoto
              photo={photos.finaleHub}
              alt={t("hubAlt")}
              sizes="(min-width: 1024px) 34vw, 92vw"
              className="aspect-[16/9] lg:col-span-5 lg:aspect-[4/5]"
              position="50% 35%"
            />
            <Reveal className="flex flex-col gap-5 lg:col-span-6 lg:col-start-7">
              <Headline raw={t.raw("line") as string} className="text-display-lg" />
              <p className="max-w-[46ch] text-body-lg text-paper-300">{t("lineBody")}</p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
