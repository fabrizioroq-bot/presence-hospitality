import { getTranslations } from "next-intl/server";
import { Headline } from "@/components/ui/Headline";
import { EditorialPhoto } from "@/components/ui/EditorialPhoto";
import { Reveal } from "@/components/ui/Reveal";
import { photos } from "@/content/photos";
import { DemandChart } from "./DemandChart";

/**
 * Home 03 (quiet): the staffing problem as one sentence, a real reception at night and the 24-hour
 * chart (light version). No tech effects.
 */
export async function ProblemQuiet() {
  const t = await getTranslations("problemQuiet");
  const p = await getTranslations("problem");
  return (
    <section
      id="problem"
      data-mood="mist"
      data-tone="lavender"
      aria-labelledby="problem-title"
      className="relative bg-mist-bg py-16 text-ink-900 lg:py-32"
    >
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-6">
        <div className="flex flex-col gap-6 lg:col-span-6">
          <p className="text-label text-ink-700">{t("eyebrow")}</p>
          <Headline id="problem-title" raw={t.raw("title") as string} className="max-w-[18ch] text-display-lg" />
          <Reveal>
            <p className="max-w-[52ch] text-body-lg text-ink-700">{t("body")}</p>
          </Reveal>
        </div>
        <EditorialPhoto
          photo={photos.problem}
          alt={t("photoAlt")}
          sizes="(min-width: 1024px) 38vw, 92vw"
          className="hidden lg:col-span-5 lg:col-start-8 lg:block lg:aspect-[4/5]"
          position="50% 60%"
        />
      </div>
      <div className="container-site mt-12 lg:mt-20">
        <Reveal className="chart-light rounded-xl bg-mist-surface p-5 sm:p-8 lg:p-10">
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
        </Reveal>
      </div>
    </section>
  );
}
