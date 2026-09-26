import { getTranslations } from "next-intl/server";
import { AmbientDust } from "@/components/ambient/AmbientDust";
import { MoodTransition } from "@/components/ambient/MoodTransition";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { StoryCarousel } from "@/components/story/StoryCarousel";
import { StoryPinned, type StoryLabels } from "@/components/story/StoryPinned";
import { ButtonLink } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { Reveal } from "@/components/ui/Reveal";

export async function HowItWorks() {
  const t = await getTranslations("how");
  const c = await getTranslations("common");
  const n = [1, 2, 3, 4, 5, 6] as const;
  const labels: StoryLabels = {
    step: t("step"),
    steps: n.map((i) => ({ title: t(`s${i}Title`), body: t(`s${i}Body`) })),
    kiosk: {
      welcome: t("kWelcome"),
      lastName: t("kLastName"),
      booking: t("kBooking"),
      checkIn: t("kCheckIn"),
      alert: t("kAlert"),
      alertHint: t("kAlertHint"),
      calling: t("kCalling"),
      done: t("kDone"),
    },
    scene: {
      entrance: t("lEntrance"),
      kiosk: t("lKiosk"),
      holobox: t("lHolobox"),
      hub: t("lHub"),
      tap: t("lTap"),
      live: t("lLive"),
    },
    sceneDesc: t("sceneDesc"),
  };
  const sketchLabels = { entrance: t("lEntrance"), kiosk: t("lKiosk"), holobox: t("lHolobox"), hub: t("lHub") };

  return (
    <>
      <MoodTransition from="night" to="mist" />
      <section
        id="how-it-works"
        data-mood="mist"
        aria-labelledby="how-title"
        className="relative isolate bg-mist-bg text-ink-900"
      >
        <ParallaxOrbs
          orbs={[
            { color: "sky", size: "min(60vw, 820px)", top: "4%", left: "-20%", opacity: 0.55, dur: 23 },
            { color: "mint", size: "min(36vw, 480px)", top: "40%", right: "-10%", opacity: 0.45, dur: 25 },
            { color: "peach", size: "min(24vw, 320px)", bottom: "8%", left: "30%", opacity: 0.4, dur: 21 },
          ]}
        />
        <AmbientDust mood="mist" density={0.5} />

        <div className="container-site flex flex-col gap-6 pt-16 lg:pt-24">
          <p className="text-label text-ink-700">{t("eyebrow")}</p>
          <Headline id="how-title" raw={t.raw("title") as string} className="text-display-xl" />
          <Reveal>
            <p className="max-w-[52ch] text-body-lg text-ink-700">{t("sub")}</p>
          </Reveal>
        </div>

        {/* Desktop, motion allowed: pinned scroll story */}
        <div className="hidden lg:block motion-reduce:!hidden">
          <StoryPinned labels={labels} />
        </div>

        {/* Mobile / reduced motion: one animated lobby scene + swipeable steps */}
        <div className="container-site mt-10 lg:hidden motion-reduce:!block lg:motion-reduce:max-w-3xl">
          <StoryCarousel
            labels={{
              region: t("carousel"),
              step: t("step"),
              prev: t("prev"),
              next: t("next"),
              goTo: t.raw("goTo") as string,
              steps: labels.steps,
              sketch: sketchLabels,
            }}
          />
        </div>

        <div className="container-site flex flex-col items-start gap-4 pt-10 pb-20 sm:flex-row sm:items-center lg:pt-8 lg:pb-32">
          <p className="text-heading-md">{t("ctaLead")}</p>
          <ButtonLink href="#demo" arrow>
            {c("bookDemo")}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
