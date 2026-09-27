import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { CtaBand } from "@/components/sections/CtaBand";
import { Faq } from "@/components/sections/Faq";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import type { Locale } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.faq" });
  return pageMeta(locale, "/faq", t("title"), t("description"));
}

export default async function Page({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageShell page="/faq">
      <FaqJsonLd />
      <Faq asPage />
      <CtaBand from="mist" />
    </PageShell>
  );
}
