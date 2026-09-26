import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/sections/LegalPage";
import { legal } from "@/content/legal";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  const doc = legal[locale === "nl" ? "nl" : "en"].privacy;
  return { title: `${doc.title} · Presence Hospitality`, alternates: { canonical: `/${locale}/privacy`, languages: { en: "/en/privacy", nl: "/nl/privacy" } } };
}

export default async function Page({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale === "nl" ? "nl" : "en";
  return <LegalPage doc={legal[l].privacy} locale={l} />;
}
