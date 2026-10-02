import { getLocale, getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { AmbientDust } from "@/components/ambient/AmbientDust";
import { LightSweep } from "@/components/ambient/LightSweep";
import { site } from "@/content/site";
import { pagePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

const icon = {
  phone:
    "M3 3.5C3 2.7 3.7 2 4.5 2h1.3c.4 0 .8.3.9.7l.7 2.4c.1.4 0 .8-.3 1l-1 .9a8 8 0 0 0 3.9 3.9l.9-1c.3-.3.7-.4 1-.3l2.4.7c.4.1.7.5.7.9v1.3c0 .8-.7 1.5-1.5 1.5A11.5 11.5 0 0 1 3 3.5Z",
  web: "M8 1.75a6.25 6.25 0 1 0 0 12.5 6.25 6.25 0 0 0 0-12.5Zm-6.25 6.25h12.5M8 1.75c1.7 1.8 2.5 3.9 2.5 6.25S9.7 12.45 8 14.25C6.3 12.45 5.5 10.35 5.5 8S6.3 3.55 8 1.75Z",
  mail: "M2 4h12v8H2zM2 4.5l6 4.5 6-4.5",
  pin: "M8 14.5s4.5-4.2 4.5-8a4.5 4.5 0 0 0-9 0c0 3.8 4.5 8 4.5 8Zm0-6.3a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z",
};

function Icon({ d }: { d: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="mt-0.5 h-4 w-4 shrink-0 text-paper-300"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const NAV = [
  ["/", "howItWorks", "how-it-works"],
  ["/solution", "solution", undefined],
  ["/packages", "packages", undefined],
  ["/onboarding", "onboarding", undefined],
  ["/faq", "faq", undefined],
  ["/about", "about", undefined],
] as const;

export async function Footer() {
  const t = await getTranslations("footer");
  const c = await getTranslations("common");
  const n = await getTranslations("nav");
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <>
      <footer
        data-mood="night"
        className="relative isolate overflow-hidden bg-charcoal-700 text-paper-50"
      >
        <ParallaxOrbs
          orbs={[
            {
              color: "sky",
              size: "min(60vw, 820px)",
              top: "-30%",
              right: "-20%",
              opacity: 0.18,
            },
            {
              color: "peach",
              size: "min(30vw, 420px)",
              bottom: "-20%",
              left: "5%",
              opacity: 0.12,
              dur: 25,
            },
          ]}
        />
        <LightSweep />
        <AmbientDust mood="night" density={0.8} />
        <div className="container-site pt-12 lg:pt-32">
          {/* Giant wordmark, like the pitch's closing "Thank You" */}
          <div className="relative">
            {/* Decorative wordmark as SVG (not body text, so it isn't subject to text contrast rules). */}
            <svg
              aria-hidden
              viewBox="0 0 1000 205"
              className="block h-auto w-full select-none"
            >
              <text
                x="-6"
                y="190"
                fill="var(--paper-50)"
                fillOpacity={0.1}
                fontFamily="var(--font-hanken), sans-serif"
                fontWeight={800}
                fontSize={262}
                letterSpacing="-15"
              >
                Presence
              </text>
            </svg>
            <p className="mt-4 text-body text-paper-300 lg:absolute lg:mt-0 lg:text-body-lg lg:right-0 lg:bottom-[12%]">
              {t("tagline")}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line-night/40 pt-8 lg:mt-16 lg:grid-cols-4 lg:gap-12 lg:pt-12">
            <div className="col-span-2 flex flex-col gap-4 lg:col-span-1">
              <Logo onNight />
              <p className="text-body-sm text-paper-300">
                {c("companyOf")}{" "}
                <span className="font-semibold text-paper-50">
                  {site.parent}
                </span>
              </p>
            </div>

            <div className="col-span-2 flex flex-col gap-4 lg:col-span-1">
              <h2 className="text-label text-paper-500">{t("contact")}</h2>
              <ul className="flex flex-col gap-3 text-body-sm">
                {site.phones.map((ph) => (
                  <li key={ph.key} className="flex gap-3">
                    <Icon d={icon.phone} />
                    <span>
                      <span className="text-paper-300">{c(ph.key === "sales" ? "phoneSales" : "phoneSupport")}</span>{" "}
                      <a href={ph.href} className="hover:text-holo-300">
                        {ph.display}
                      </a>
                    </span>
                  </li>
                ))}
                <li className="flex gap-3">
                  <Icon d={icon.web} />
                  <a href={site.domainUrl} className="hover:text-holo-300">
                    {site.displayUrl}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Icon d={icon.mail} />
                  <a
                    href={`mailto:${site.email}`}
                    className="break-all hover:text-holo-300"
                  >
                    {site.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Icon d={icon.pin} />
                  <a
                    href={site.address.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-holo-300"
                  >
                    {site.address.street}, {site.address.city}
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-label text-paper-500">{t("explore")}</h2>
              <ul className="flex flex-col gap-3 text-body-sm">
                {NAV.map(([page, key, hash]) => (
                  <li key={key}>
                    <a href={pagePath(locale as Locale, page, hash)} className="hover:text-holo-300">
                      {n(key)}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={pagePath(locale as Locale, "/demo")} className="hover:text-holo-300">
                    {c("bookDemo")}
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-label text-paper-500">{t("legal")}</h2>
              <ul className="flex flex-col gap-3 text-body-sm text-paper-300">
                <li>
                  <a
                    href={`/${locale}/privacy`}
                    className="text-paper-50 hover:text-holo-300"
                  >
                    {t("privacy")}
                  </a>
                </li>
                <li>
                  <a href={`/${locale}/cookies`} className="text-paper-50 hover:text-holo-300">
                    {t("cookies")}
                  </a>
                </li>
                <li>
                  © {year} {site.legalName}
                </li>
                {site.kvk && (
                  <li>
                    {t("kvk")} {site.kvk}
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-row items-center justify-between gap-4 border-t border-line-night/40 pt-4 pb-24 text-body-sm text-paper-300 lg:mt-16 lg:py-8">
            <div className="flex flex-col gap-1">
              <span>{t("rights")}</span>
              {/* Credit: deliberately small and quiet. */}
              <span className="text-[0.75rem] text-paper-500">{t("credit")}</span>
            </div>
            <a
              href="#top"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 hover:text-holo-300"
            >
              {c("backToTop")} <span aria-hidden>↑</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
