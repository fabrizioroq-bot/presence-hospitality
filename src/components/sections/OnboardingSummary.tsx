import { getLocale, getTranslations } from "next-intl/server";
import { Headline } from "@/components/ui/Headline";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { pagePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

type Step = { title: string };

/** Home 11 (summary → /onboarding): the six steps in one calm list. */
export async function OnboardingSummary() {
  const t = await getTranslations("onboardingSummary");
  const o = await getTranslations("onboarding");
  const locale = (await getLocale()) as Locale;
  const steps = o.raw("steps") as Step[];
  return (
    <section
      id="onboarding-summary"
      data-mood="mist"
      data-tone="lavender"
      aria-labelledby="onboarding-summary-title"
      className="relative bg-mist-bg py-16 text-ink-900 lg:py-28"
    >
      <div className="container-site flex flex-col gap-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="flex flex-col gap-6">
            <p className="text-label text-ink-700">{t("eyebrow")}</p>
            <Headline id="onboarding-summary-title" raw={t.raw("title") as string} className="max-w-[16ch] text-display-lg" />
            <p className="max-w-[52ch] text-body-lg text-ink-700">{t("sub")}</p>
          </div>
          <a href={pagePath(locale, "/onboarding")} className="w-fit shrink-0 text-body font-semibold text-link-mist underline underline-offset-4">
            {t("more")} <span aria-hidden>→</span>
          </a>
        </div>
        <RevealGroup as="ol" className="grid grid-cols-2 gap-x-4 border-t border-line-mist/40 lg:grid-cols-3" gap={0.06}>
          {steps.map((s, i) => (
            <RevealItem as="li" key={s.title} className="flex items-baseline gap-3 border-b border-line-mist/40 py-4 sm:gap-4 sm:py-5 sm:pr-6">
              <span className="step-num text-label" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-heading-sm">{s.title}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
