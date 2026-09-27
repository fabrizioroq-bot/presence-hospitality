import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { LegalPage } from "@/components/sections/LegalPage";
import { alternates, pagePath } from "@/i18n/paths";
import { legal } from "@/content/legal";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cookies">): Promise<Metadata> {
  const { locale } = await params;
  const doc = legal[locale === "nl" ? "nl" : "en"].cookies;
  return {
    title: `${doc.title} · Presence Hospitality`,
    alternates: {
      canonical: pagePath(locale === "nl" ? "nl" : "en", "/cookies"),
      ...alternates("/cookies"),
    },
  };
}

export default async function Page({ params }: PageProps<"/[locale]/cookies">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale === "nl" ? "nl" : "en";
  return (
    <PageShell page="/cookies">
      <LegalPage doc={legal[l].cookies} locale={l} />
    </PageShell>
  );
}
