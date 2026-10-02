import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { About } from "@/components/sections/About";
import { CtaBand } from "@/components/sections/CtaBand";
import type { Locale } from "@/i18n/routing";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  return pageMeta(locale, "/about", t("title"), t("description"));
}

/** About (EN /en/about, NL /nl/over-ons): who we are, company details, what we do. */
export default async function Page({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.about");
  return (
    <PageShell page="/about">
      <PageHeader eyebrow={t("eyebrow")} h1={t.raw("h1") as string} sub={t("sub")} />
      <About />
      <CtaBand from="mist" tone="ivory" />
    </PageShell>
  );
}
