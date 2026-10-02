import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CtaBand } from "@/components/sections/CtaBand";
import { Pricing } from "@/components/sections/Pricing";
import { PackagesCalm } from "@/components/sections/PackagesCalm";
import type { Locale } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/packages">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.packages" });
  return pageMeta(locale, "/packages", t("title"), t("description"));
}

export default async function Page({
  params,
}: PageProps<"/[locale]/packages">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.packages");
  return (
    <PageShell page="/packages">
      <PageHeader
        eyebrow={t("eyebrow")}
        h1={t.raw("h1") as string}
        sub={t("sub")}
      />
      <PackagesCalm />
      <Pricing />
      <CtaBand from="mist" tone="lavender" />
    </PageShell>
  );
}
