import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/sections/LegalPage";
import { legal } from "@/content/legal";

export async function generateMetadata({ params }: PageProps<"/[locale]/cookies">): Promise<Metadata> {
  const { locale } = await params;
  const doc = legal[locale === "nl" ? "nl" : "en"].cookies;
  return { title: `${doc.title} · Presence Hospitality`, alternates: { canonical: `/${locale}/cookies`, languages: { en: "/en/cookies", nl: "/nl/cookies" } } };
}

export default async function Page({ params }: PageProps<"/[locale]/cookies">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale === "nl" ? "nl" : "en";
  return <LegalPage doc={legal[l].cookies} locale={l} />;
}
