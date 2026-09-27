import { getTranslations } from "next-intl/server";
import { MoodTransition } from "@/components/ambient/MoodTransition";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { Depth } from "@/components/ui/Depth";
import { Headline } from "@/components/ui/Headline";
import { Reveal } from "@/components/ui/Reveal";
import { BeamDiagram } from "./BeamDiagram";

/** Integrations: copy left, hub-and-spoke diagram right. Partner names as plain text, no logos. */
export async function Integrations({ from }: { from?: "night" | "deep" } = {}) {
  const t = await getTranslations("integrations");
  return (
    <>
      {from && <MoodTransition from={from} to="mist" />}
      <section
        id="integrations"
        data-mood="mist"
        aria-labelledby="integrations-title"
        className="relative isolate overflow-hidden bg-mist-bg pt-10 pb-16 text-ink-900 lg:pt-24 lg:pb-40"
      >
        <ParallaxOrbs
          orbs={[
            {
              color: "sky",
              size: "min(46vw, 640px)",
              top: "20%",
              right: "4%",
              opacity: 0.55,
              dur: 23,
            },
            {
              color: "peach",
              size: "min(24vw, 320px)",
              bottom: "6%",
              right: "38%",
              opacity: 0.4,
              dur: 26,
            },
          ]}
        />
        <div className="container-site grid items-center gap-16 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-6 lg:col-span-5">
            <p className="text-label text-ink-700">{t("eyebrow")}</p>
            <Headline
              id="integrations-title"
              raw={t.raw("title") as string}
              className="text-display-lg"
            />
            <Reveal className="flex flex-col gap-4">
              <p className="max-w-[46ch] text-body-lg text-ink-700">
                {t("body")}
              </p>
              <p className="max-w-[46ch] text-body-sm text-ink-500">
                {t("small")}
              </p>
            </Reveal>
          </div>
          <Depth range={-24} className="lg:col-span-7">
            <Reveal>
              <BeamDiagram
                hub={t("nHub")}
                guestLabel={t("guestSide")}
                systemLabel={t("systemSide")}
                desc={t("desc")}
                guest={[
                  { id: "holobox", label: t("nHolobox") },
                  { id: "kiosk", label: t("nKiosk") },
                  { id: "chat", label: t("nChat") },
                ]}
                systems={[
                  { id: "mews", label: t("nMews") },
                  { id: "gauvendi", label: t("nGauvendi") },
                  { id: "hotek", label: t("nHotek") },
                  { id: "payments", label: t("nPayments") },
                  { id: "access", label: t("nAccess") },
                ]}
              />
            </Reveal>
          </Depth>
        </div>
      </section>
    </>
  );
}
