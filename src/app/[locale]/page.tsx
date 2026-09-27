import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { CtaBand } from "@/components/sections/CtaBand";
import { ExperienceStage } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { KeyBenefits } from "@/components/sections/KeyBenefits";
import { MarketProblem } from "@/components/sections/MarketProblem";
import { WelcomeBand } from "@/components/sections/WelcomeBand";
import type { Locale } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMeta(locale, "/", t("title"), t("description"));
}

/** Home: hero · problem in brief · how it works · the Holobox · key benefits · CTA. */
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageShell page="/">
      <Hero />
      <MarketProblem />
      <HowItWorks />
      <ExperienceStage />
      <WelcomeBand />
      <KeyBenefits />
      <CtaBand from="mist" />
    </PageShell>
  );
}
