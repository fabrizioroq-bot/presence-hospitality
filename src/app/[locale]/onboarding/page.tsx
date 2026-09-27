import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { CtaBand } from "@/components/sections/CtaBand";
import { Onboarding } from "@/components/sections/Onboarding";
import type { Locale } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/onboarding">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.onboarding" });
  return pageMeta(locale, "/onboarding", t("title"), t("description"));
}

export default async function Page({
  params,
}: PageProps<"/[locale]/onboarding">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageShell page="/onboarding">
      <Onboarding asPage />
      <CtaBand from="mist" />
    </PageShell>
  );
}
