import { getTranslations } from "next-intl/server";
import { MistOrbs } from "@/components/brand/MistOrbs";
import { HexMotif } from "@/components/brand/HexMotif";
import { HoloboxPortal } from "@/components/hologram/HoloboxPortal";
import { AnimatedWords } from "@/components/ui/AnimatedWords";
import { ButtonLink } from "@/components/ui/Button";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { splitHeadline } from "@/lib/headline";
import { HeroShell, Parallax } from "@/components/hero/HeroShell";

export async function Hero() {
  const t = await getTranslations("hero");
  const c = await getTranslations("common");

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

      {/* "A company of [partner]" — top-right label, as in the pitch header */}
      <p className="absolute top-[calc(var(--nav-h)+20px)] right-12 hidden text-right text-body-sm leading-tight text-ink-700 lg:block">
        {c("companyOf")}
        <br />
        <span className="font-semibold text-ink-900">[partner]</span>
      </p>

      <div className="container-site grid items-center gap-12 lg:min-h-[calc(100svh-var(--nav-h)-60px)] lg:grid-cols-12 lg:gap-6">
        <Parallax className="flex min-w-0 flex-col gap-8 lg:col-span-7 lg:pr-6" mouse={[-6, -4]} scroll={-70}>
          <p className="text-label text-ink-700">{t("eyebrow")}</p>
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
            <RevealItem soft className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="#demo" arrow>
                {c("bookDemo")}
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="ghost">
                {t("ctaSecondary")}
              </ButtonLink>
            </RevealItem>
            <RevealItem soft>
              <p className="text-body-sm text-ink-500">{t("note")}</p>
              <p className="mt-2 text-body-sm text-ink-500 lg:hidden">
                {c("companyOf")} <span className="font-semibold text-ink-900">[partner]</span>
              </p>
            </RevealItem>
          </RevealGroup>
        </Parallax>

        <Parallax className="min-w-0 lg:col-span-5 lg:col-start-8" mouse={[14, 10]} scroll={60}>
          <HoloboxPortal
            className="mx-auto h-[62svh] min-h-[420px] w-full lg:aspect-[3/4.4] lg:h-auto lg:max-h-[78svh] lg:min-h-0 lg:w-auto"
            hud={{ online: t("hudOnline"), route: t("hudRoute"), live: t("hudLive") }}
            description={t("portalAlt")}
          />
        </Parallax>
      </div>
    </HeroShell>
  );
}
