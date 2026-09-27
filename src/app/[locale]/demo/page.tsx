import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { Demo } from "@/components/sections/Demo";
import type { Locale } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/demo">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.demo" });
  return pageMeta(locale, "/demo", t("title"), t("description"));
}

export default async function Page({ params }: PageProps<"/[locale]/demo">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageShell page="/demo">
      <Demo asPage />
    </PageShell>
  );
}
