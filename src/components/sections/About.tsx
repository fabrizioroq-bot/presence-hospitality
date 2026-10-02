import { getLocale, getTranslations } from "next-intl/server";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { Depth } from "@/components/ui/Depth";
import { EditorialPhoto } from "@/components/ui/EditorialPhoto";
import { Reveal } from "@/components/ui/Reveal";
import { photos } from "@/content/photos";
import { site } from "@/content/site";
import { pagePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

const WHAT = ["solution", "packages", "onboarding"] as const;

/**
 * About page body (ivory): the hospitality-origin story (copy left) beside the company details panel (outlined,
 * right), then "What we do" as divided rows that link to the pages that explain each part.
 * Every fact comes from src/content/site.ts.
 */
export async function About() {
  const t = await getTranslations("pages.about");
  const c = await getTranslations("common");
  const locale = (await getLocale()) as Locale;
  const facts: [string, React.ReactNode][] = [
    [t("company"), site.legalName],
    [t("partOf"), site.parent],
    [
      t("office"),
      <a key="office" href={site.address.mapsHref} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
        {site.address.street}, <span className="whitespace-nowrap">{site.address.postalCode} {site.address.city}</span>
      </a>,
    ],
    [
      t("email"),
      <a key="email" href={`mailto:${site.email}`} className="break-all underline-offset-4 hover:underline">
        {site.email}
      </a>,
    ],
    ...site.phones.map(
      (ph) =>
        [
          c(ph.key === "sales" ? "phoneSales" : "phoneSupport"),
          <a key={ph.key} href={ph.href} className="underline-offset-4 hover:underline">
            {ph.display}
          </a>,
        ] as [string, React.ReactNode],
    ),
    [
      t("website"),
      <a key="web" href={site.domainUrl} className="underline-offset-4 hover:underline">
        {site.displayUrl}
      </a>,
    ],
  ];

  return (
    <section
      data-mood="mist"
      data-tone="ivory"
      aria-labelledby="about-who"
      className="relative isolate overflow-hidden bg-mist-bg pt-12 pb-16 text-ink-900 lg:pt-24 lg:pb-40"
    >
      <ParallaxOrbs
        orbs={[
          { color: "lavender", size: "min(44vw, 600px)", top: "10%", right: "-12%", opacity: 0.45, dur: 22 },
          { color: "peach", size: "min(22vw, 300px)", bottom: "8%", left: "30%", opacity: 0.35, dur: 26 },
        ]}
      />
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-6">
        <EditorialPhoto
          photo={photos.about}
          alt={t("photoAlt")}
          sizes="(min-width: 1360px) 1264px, 94vw"
          className="aspect-[16/9] lg:col-span-12 lg:aspect-[21/8]"
          position="50% 55%"
        />
        <Reveal className="flex flex-col gap-6 lg:col-span-6">
          <h2 id="about-who" className="text-display-lg">
            {t("whoTitle")}
          </h2>
          <p className="max-w-[56ch] text-body-lg text-ink-700">{t("who1")}</p>
          <p className="max-w-[56ch] text-body-lg text-ink-700">{t("who2")}</p>
          <p className="max-w-[56ch] text-body-lg text-ink-700">{t("who3")}</p>
        </Reveal>

        <Depth range={-24} className="lg:col-span-5 lg:col-start-8">
          <Reveal>
            <div className="rounded-xl border border-line-mist p-8 lg:p-10">
              <h2 className="text-heading-md">{t("contactTitle")}</h2>
              <dl className="mt-6 flex flex-col divide-y divide-line-mist/40 text-body">
                {facts.map(([k, v]) => (
                  <div key={k} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
                    <dt className="text-body-sm text-ink-500">{k}</dt>
                    <dd className="text-ink-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </Depth>

        <div className="mt-8 lg:col-span-12 lg:mt-24">
          <h2 className="text-display-lg">{t("whatTitle")}</h2>
          <ul className="mt-8 border-t border-line-mist/60">
            {WHAT.map((key, i) => (
              <Reveal as="li" key={key} className="grid gap-3 border-b border-line-mist/60 py-8 lg:grid-cols-12 lg:gap-6 lg:py-10">
                <span className="step-num text-label lg:col-span-1 lg:pt-2" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-heading-md lg:col-span-4">{t(`what.${key}.t`)}</h3>
                <div className="flex flex-col items-start gap-3 lg:col-span-7">
                  <p className="max-w-[56ch] text-body text-ink-700">{t(`what.${key}.d`)}</p>
                  <a href={pagePath(locale, `/${key}`)} className="text-body font-semibold text-ink-900 underline underline-offset-4 hover:text-teal-text">
                    {t(`what.${key}.link`)} <span aria-hidden>→</span>
                  </a>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
