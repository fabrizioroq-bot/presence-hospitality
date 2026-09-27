import { getLocale, getTranslations } from "next-intl/server";
import { pagePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";
import { MoodTransition } from "@/components/ambient/MoodTransition";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { ButtonLink } from "@/components/ui/Button";
import { Headline } from "@/components/ui/Headline";
import { NeonSign } from "@/components/ui/NeonSign";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/** Pricing structure (no prices): stacked title + outlined three-column panel + "HOTEL" neon strip. Mist. */
export async function Pricing() {
  const t = await getTranslations("pricing");
  const locale = (await getLocale()) as Locale;
  const cols = [
    { title: t("c1Title"), lead: null, items: t.raw("c1") as string[], optional: false },
    { title: t("c2Title"), lead: t("c2Lead"), items: t.raw("c2") as string[], optional: false },
    { title: t("c3Title"), lead: null, items: t.raw("c3") as string[], optional: true },
  ];
  return (
    <>
      <MoodTransition from="night" to="mist" />
      <section
        id="pricing"
        data-mood="mist"
        aria-labelledby="pricing-title"
        className="relative isolate overflow-hidden bg-mist-bg pt-8 pb-24 text-ink-900 lg:pb-32"
      >
        <ParallaxOrbs
          orbs={[
            { color: "sky", size: "min(40vw, 560px)", bottom: "-10%", left: "-10%", opacity: 0.55, dur: 22 },
            { color: "mint", size: "min(26vw, 360px)", top: "10%", right: "20%", opacity: 0.4, dur: 25 },
          ]}
        />

        {/* Vertical "HOTEL" neon on a night strip, as in the pitch photo (desktop). */}
        <div aria-hidden className="absolute inset-y-0 right-0 hidden w-28 items-center justify-center bg-night-900 xl:flex">
          <NeonSign />
        </div>

        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-6 xl:pr-40">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <p className="text-label text-ink-700">{t("eyebrow")}</p>
            <Headline id="pricing-title" raw={t.raw("title") as string} className="max-w-[8ch] text-display-xl" />
            <Reveal>
              <p className="max-w-[36ch] text-body-lg text-ink-700">{t("sub")}</p>
            </Reveal>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-8">
            <RevealGroup className="grid rounded-xl border border-line-mist md:grid-cols-3" gap={0.1}>
              {cols.map((col, i) => (
                <RevealItem
                  key={col.title}
                  className={cn(
                    "relative flex flex-col gap-5 p-8",
                    i > 0 && "border-t border-line-mist md:border-t-0",
                    i > 0 && "md:before:absolute md:before:inset-y-8 md:before:left-0 md:before:w-px md:before:bg-line-mist",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-heading-md">{col.title}</h3>
                    {col.optional && (
                      <span className="rounded-pill px-3 py-1 text-label text-ink-700 ring-1 ring-line-mist">{t("optional")}</span>
                    )}
                  </div>
                  {col.lead && <p className="text-body-sm text-ink-500">{col.lead}</p>}
                  <ul className="flex flex-col gap-3 text-body text-ink-700">
                    {col.items.map((it) => (
                      <li key={it} className="flex gap-3">
                        <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-900" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </RevealItem>
              ))}
            </RevealGroup>
            <Reveal>
              <ButtonLink href={pagePath(locale, "/demo")} variant="ghost" arrow>
                {t("cta")}
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
