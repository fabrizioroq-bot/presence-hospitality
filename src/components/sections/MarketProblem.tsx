import { getLocale, getTranslations } from "next-intl/server";
import { AmbientDust } from "@/components/ambient/AmbientDust";
import { LightSweep } from "@/components/ambient/LightSweep";
import { MoodTransition } from "@/components/ambient/MoodTransition";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { Headline } from "@/components/ui/Headline";
import { LineReveal } from "@/components/ui/LineReveal";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { claims } from "@/content/claims";
import { Depth } from "@/components/ui/Depth";
import { DemandChart } from "./DemandChart";

/** Market context (statement band) + The problem (pitch-style panel + 24 h chart). One night block. */
export async function MarketProblem() {
  const t = await getTranslations("market");
  const p = await getTranslations("problem");
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
      <div
        data-mood="night"
        className="relative isolate overflow-hidden bg-charcoal-700 text-paper-50"
      >
        <ParallaxOrbs
          range={90}
          orbs={[
            {
              color: "sky",
              size: "min(55vw, 760px)",
              top: "2%",
              right: "-18%",
              opacity: 0.2,
              dur: 24,
            },
            {
              color: "peach",
              size: "min(30vw, 420px)",
              top: "38%",
              left: "-8%",
              opacity: 0.14,
              dur: 26,
            },
            {
              color: "lavender",
              size: "min(40vw, 560px)",
              bottom: "-6%",
              right: "12%",
              opacity: 0.12,
              dur: 20,
            },
          ]}
        />
        <LightSweep />
        <AmbientDust mood="night" density={0.7} />

        {/* ---------------- Market context ---------------- */}
        <section
          id="context"
          aria-labelledby="context-title"
          className="container-site pt-8 pb-24 lg:pt-16 lg:pb-32"
        >
          <div className="grid gap-10 lg:grid-cols-12">
            <p
              id="context-title"
              className="text-label text-paper-500 lg:col-span-12"
            >
              {t("eyebrow")}
            </p>
            <Depth range={-30} className="lg:col-span-8">
              <LineReveal
                className="text-display-lg max-w-[22ch] text-paper-50"
                lines={[
                  t.raw("line1") as string,
                  t.raw("line2") as string,
                  t.raw("line3") as string,
                ]}
              />
            </Depth>
            <Depth range={40} className="self-end lg:col-span-4">
              <Reveal className="flex flex-col gap-6">
                <p className="max-w-[52ch] text-body-lg text-paper-300">
                  {t("body")}
                </p>
                {tax.enabled && tax.source && (
                  <div className="rounded-lg border border-line-night p-6 text-body-sm text-paper-300">
                    <p>{tax[locale]}</p>
                    <a
                      href={tax.source}
                      className="mt-3 inline-block text-holo-300 underline underline-offset-4"
                    >
                      {t("source")}
                    </a>
                  </div>
                )}
              </Reveal>
            </Depth>
          </div>
        </section>

        {/* ---------------- The problem ---------------- */}
        <section
          id="problem"
          aria-labelledby="problem-title"
          className="container-site pb-24 lg:pb-40"
        >
          <div className="flex flex-col gap-6">
            <p className="text-label text-paper-500">{p("eyebrow")}</p>
            <Headline
              id="problem-title"
              raw={p.raw("title") as string}
              className="text-display-xl"
            />
            <Reveal>
              <p className="max-w-[52ch] text-body-lg text-paper-300">
                {p("sub")}
              </p>
            </Reveal>
          </div>

          {/* Pitch signature: one outlined panel split into three columns */}
          <RevealGroup
            className="mt-12 grid rounded-xl border border-line-night lg:mt-16 lg:grid-cols-3"
            gap={0.1}
          >
            {columns.map((c, i) => (
              <RevealItem
                key={c.title}
                className={
                  "relative flex flex-col gap-5 p-8 lg:px-10 lg:py-12 " +
                  (i > 0 ? "border-t border-line-night lg:border-t-0" : "")
                }
              >
                {i > 0 && (
                  <span
                    aria-hidden
                    className="absolute inset-y-8 left-0 hidden w-px bg-line-night lg:block"
                  />
                )}
                <span
                  aria-hidden
                  className="h-5 w-5 rounded-full bg-holo-gradient shadow-glow-holo"
                />
                <h3 className="text-caps text-paper-50">{c.title}</h3>
                <p className="text-body text-paper-300">{c.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>

          <Depth range={30} className="mt-16 lg:mt-24">
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
        </section>
      </div>
    </>
  );
}
