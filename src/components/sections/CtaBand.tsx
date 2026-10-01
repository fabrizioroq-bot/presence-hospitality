import { getLocale, getTranslations } from "next-intl/server";
import { AmbientDust } from "@/components/ambient/AmbientDust";
import { LightSweep } from "@/components/ambient/LightSweep";
import { MoodTransition, type Tone } from "@/components/ambient/MoodTransition";
import { ButtonLink } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { site } from "@/content/site";
import { pagePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

/** Closing "Book a demo" band before the footer (night). */
export async function CtaBand({
  from = "mist",
  tone,
}: {
  from?: "mist" | "night" | "deep" | null;
  /** Tone of the light section above. */
  tone?: Tone;
}) {
  const t = await getTranslations("ctaBand");
  const c = await getTranslations("common");
  const locale = (await getLocale()) as Locale;
  return (
    <>
      {from && from !== "night" && <MoodTransition from={from} to="night" tone={tone} />}
      <section data-mood="night" aria-label={c("bookDemo")} className="relative isolate overflow-hidden bg-charcoal-700 py-16 text-paper-50 lg:py-24">
        <LightSweep />
        <AmbientDust mood="night" density={0.5} />
        <div className="container-site flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5">
            <Headline raw={t.raw("title") as string} className="text-display-lg" />
            <p className="max-w-[44ch] text-body-lg text-paper-300">{t("body")}</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={pagePath(locale, "/demo")} mood="night" arrow>
              {c("bookDemo")}
            </ButtonLink>
            <span className="text-body-sm text-paper-300">
              {t("or")}{" "}
              <a href={site.phones[0].href} className="text-paper-50 underline underline-offset-4 hover:text-holo-300">
                {site.phones[0].display}
              </a>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
