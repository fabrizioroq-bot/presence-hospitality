import { getTranslations } from "next-intl/server";
import { AmbientDust } from "@/components/ambient/AmbientDust";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { HexMotif } from "@/components/brand/HexMotif";
import { OnboardingTimeline, type OnboardingStep } from "@/components/onboarding/OnboardingTimeline";
import { Depth } from "@/components/ui/Depth";
import { Headline } from "@/components/ui/Headline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

/** Onboarding: public workflow (client-facing steps only) + go-live checklist + first KPIs. Mist. */
export async function Onboarding() {
  const t = await getTranslations("onboarding");
  const steps = t.raw("steps") as OnboardingStep[];
  const ready = t.raw("ready") as string[];
  const kpis = t.raw("kpis") as string[];
  return (
    <section
      id="onboarding"
      data-mood="mist"
      aria-labelledby="onboarding-title"
      className="relative isolate overflow-x-clip bg-mist-bg py-24 text-ink-900 lg:py-32"
    >
      <ParallaxOrbs
        orbs={[
          { color: "lavender", size: "min(44vw, 620px)", top: "-6%", right: "-12%", opacity: 0.5, dur: 23 },
          { color: "sky", size: "min(36vw, 500px)", bottom: "4%", left: "-10%", opacity: 0.5, dur: 25 },
        ]}
      />
      <HexMotif className="right-0 bottom-0 -z-10 w-[420px] rotate-180" />
      <AmbientDust mood="mist" density={0.4} />

      <div className="container-site">
        <OnboardingTimeline
          steps={steps}
          youGet={t("youGet")}
          header={
            <div className="flex flex-col gap-6 pin:gap-4">
              <p className="text-label text-ink-700">{t("eyebrow")}</p>
              <Headline id="onboarding-title" raw={t.raw("title") as string} className="text-display-xl pin:text-display-lg" />
              <Reveal>
                <p className="onb-sub max-w-[52ch] text-body-lg text-ink-700">{t("sub")}</p>
              </Reveal>
            </div>
          }
        />

        <Depth range={24} className="mt-16 lg:mt-24">
          <RevealGroup className="grid gap-6 lg:grid-cols-2" gap={0.1}>
            <RevealItem className="rounded-xl border border-line-mist p-8">
              <h3 className="text-heading-sm font-extrabold">{t("readyTitle")}</h3>
              <ul className="mt-6 flex flex-col gap-3">
                {ready.map((r) => (
                  <li key={r} className="flex gap-3 text-body text-ink-700">
                    <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="var(--ink-900)" strokeOpacity="0.5" />
                      <path d="M6 10.5l2.6 2.6L14 7.5" stroke="var(--ink-900)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </RevealItem>
            <RevealItem className="rounded-xl border border-line-mist p-8">
              <h3 className="text-heading-sm font-extrabold">{t("kpiTitle")}</h3>
              <ul className="mt-6 flex flex-wrap gap-3">
                {kpis.map((k) => (
                  <li key={k} className="rounded-pill bg-mist-raised px-4 py-2 text-label text-ink-900 ring-1 ring-line-mist/70">
                    {k}
                  </li>
                ))}
              </ul>
            </RevealItem>
          </RevealGroup>
        </Depth>
      </div>
    </section>
  );
}
