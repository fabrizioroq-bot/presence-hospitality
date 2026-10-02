import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { hanken, hankenItalic, jetbrains } from "@/lib/fonts";
import { BOOT_SCRIPT } from "@/lib/boot-script";
import { Intro } from "@/components/intro/Intro";
import { Grain } from "@/components/brand/Grain";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CursorGlow } from "@/components/ambient/CursorGlow";
import { CursorRing } from "@/components/ambient/CursorRing";
import { DayNight } from "@/components/ambient/DayNight";
import { PageTransition } from "@/components/transition/PageTransition";
import { site } from "@/content/site";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#EEEAF3",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.domainUrl),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", nl: "/nl", "x-default": "/en" },
    },
    applicationName: site.name,
    // Search Console / Bing Webmaster ownership tags, rendered once the codes are set in site.ts.
    verification: {
      ...(site.verification.google ? { google: site.verification.google } : {}),
      ...(site.verification.bing ? { other: { "msvalidate.01": site.verification.bing } } : {}),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const cur = await getTranslations({ locale, namespace: "cursor" });
  const hero = await getTranslations({ locale, namespace: "hero" });

  return (
    <html
      lang={locale}
      className={`${hanken.variable} ${hankenItalic.variable} ${jetbrains.variable}`}
      // BOOT_SCRIPT adds classes to <html> before hydration.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        <Intro caption={hero("tagline")} />
        {/* No NextIntlClientProvider: client components receive their strings as props. */}
        {children}
        <Grain />
        <CursorGlow />
        <CursorRing labels={{ drag: cur("drag"), book: cur("book"), play: cur("play") }} />
        <DayNight />
        <SmoothScroll />
        <PageTransition />
      </body>
    </html>
  );
}
