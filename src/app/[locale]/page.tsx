import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { CtaBand } from "@/components/sections/CtaBand";
import { Hero } from "@/components/sections/Hero";
import { HoloboxFinale } from "@/components/sections/HoloboxFinale";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { KeyBenefits } from "@/components/sections/KeyBenefits";
import { OnboardingSummary } from "@/components/sections/OnboardingSummary";
import { ProblemQuiet } from "@/components/sections/ProblemQuiet";
import { RealCallVideo } from "@/components/sections/RealCallVideo";
import { RealPeople } from "@/components/sections/RealPeople";
import { StartSmall } from "@/components/sections/StartSmall";
import { TrustBar } from "@/components/sections/TrustBar";
import { WhatIf } from "@/components/sections/WhatIf";
import type { Locale } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(locale, "/", t("title"), t("description"));
}

/**
 * Home, Human → Tech → Human (Visual Trust brief): hero · trust bar · the problem · how it works (WOW) ·
 * real people · [real call] · business case · [case study] · what if · start small · onboarding ·
 * Holobox finale (WOW) · CTA. [ ] = hidden until real content exists (src/content/flags.ts).
 */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageShell page="/">
      <Hero />
      <TrustBar />
      <ProblemQuiet />
      <HowItWorks />
      <RealPeople />
      <RealCallVideo />
      <KeyBenefits />
      <CaseStudy />
      <WhatIf />
      <StartSmall />
      <OnboardingSummary />
      <HoloboxFinale />
      <CtaBand from={null} copy="ctaHome" />
    </PageShell>
  );
}
