import { Fragment } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { pagePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";
import { MistOrbs } from "@/components/brand/MistOrbs";
import { HexMotif } from "@/components/brand/HexMotif";
import { HeroPhoto } from "@/components/hero/HeroPhoto";
import { AnimatedWords } from "@/components/ui/AnimatedWords";
import { ButtonLink } from "@/components/ui/Button";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { splitHeadline } from "@/lib/headline";
import { HeroShell, Parallax } from "@/components/hero/HeroShell";
import { site } from "@/content/site";

export async function Hero() {
  const t = await getTranslations("hero");
  const c = await getTranslations("common");
  const locale = (await getLocale()) as Locale;

  return (
    <HeroShell
      id="top"
      data-mood="mist"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden pt-[calc(var(--nav-h)+24px)] pb-16 lg:min-h-svh lg:pb-12"
      style={{ background: "var(--mist-bg)", color: "var(--ink-900)" }}
    >
      <MistOrbs
        className="-z-10"
        orbs={[
          { color: "sky", size: "min(70vw, 980px)", top: "-12%", right: "-18%", opacity: 0.8, dur: 24 },
          { color: "peach", size: "min(26vw, 360px)", bottom: "4%", right: "6%", opacity: 0.55, dur: 26, dx: "-5%" },
          { color: "lavender", size: "min(44vw, 620px)", bottom: "-22%", left: "-14%", opacity: 0.55, dur: 19 },
          { color: "mint", size: "min(22vw, 300px)", top: "30%", left: "38%", opacity: 0.35, dur: 21 },
        ]}
      />
      <HexMotif className="-bottom-24 -left-24 -z-10 w-[460px]" />

      <div className="container-site grid items-center gap-10 lg:min-h-[calc(100svh-var(--nav-h)-60px)] lg:grid-cols-12 lg:gap-6">
        <Parallax className="flex min-w-0 flex-col gap-8 lg:col-span-7 lg:pr-6" mouse={[-6, -4]} scroll={-70}>
          {/* "Presence Hospitality · Front office as a service": each part stays on one line on phones. */}
          <p className="text-label text-ink-700">
            {t("eyebrow")
              .split(" · ")
              .map((part, i, parts) => (
                <Fragment key={part}>
                  <span className="whitespace-nowrap">
                    {part}
                    {i < parts.length - 1 && " ·"}
                  </span>
                  {i < parts.length - 1 && " "}
                </Fragment>
              ))}
          </p>
          <AnimatedWords
            as="h1"
            id="hero-title"
            trigger="load"
            words={splitHeadline(t.raw("title") as string)}
            className="text-display-2xl text-balance"
          />
          <RevealGroup className="flex flex-col gap-8" gap={0.08} delay={0.25} onLoad>
            <RevealItem soft>
              <p className="max-w-[52ch] text-body-lg text-ink-700">{t("lead")}</p>
            </RevealItem>
            {/* One dominant CTA; the contact email stays visible next to it (desktop and mobile). */}
            <RevealItem soft className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <ButtonLink href={pagePath(locale, "/demo")} arrow>
                {c("bookDemo")}
              </ButtonLink>
              <p className="text-body text-ink-700">
                {t("mail")}{" "}
                <a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center font-semibold break-all text-link-mist underline underline-offset-4">
                  {site.email}
                </a>
              </p>
            </RevealItem>
            <RevealItem soft>
              <p className="text-body-sm text-ink-500">{t("note")}</p>
            </RevealItem>
          </RevealGroup>
        </Parallax>

        <Parallax className="min-w-0 lg:col-span-5 lg:col-start-8" mouse={[14, 10]} scroll={60}>
          <HeroPhoto
            className="mx-auto h-[42svh] min-h-[300px] w-full lg:aspect-[3/4.4] lg:h-auto lg:max-h-[78svh] lg:min-h-0 lg:w-auto"
            alt={t("photoAlt")}
            status={t("photoStatus")}
          />
        </Parallax>
      </div>
    </HeroShell>
  );
}
