import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Benefits } from "@/components/sections/Benefits";
import { CtaBand } from "@/components/sections/CtaBand";
import { BehindTheBox } from "@/components/sections/Experience";
import { Integrations } from "@/components/sections/Integrations";
import type { Locale } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/solution">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.solution" });
  return pageMeta(locale, "/solution", t("title"), t("description"));
}

export default async function Page({
  params,
}: PageProps<"/[locale]/solution">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.solution");
  return (
    <PageShell page="/solution">
      <PageHeader
        eyebrow={t("eyebrow")}
        h1={t.raw("h1") as string}
        sub={t("sub")}
      />
      <Benefits />
      <BehindTheBox />
      <Integrations from="deep" />
      <CtaBand from="mist" tone="lavender" />
    </PageShell>
  );
}
