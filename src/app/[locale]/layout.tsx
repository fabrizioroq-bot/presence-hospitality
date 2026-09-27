import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { hanken, hankenItalic, jetbrains } from "@/lib/fonts";
import { RevealObserver } from "@/components/providers/RevealObserver";
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
  themeColor: "#D3DAE1",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.url),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", nl: "/nl", "x-default": "/en" },
    },
  };
}

// Before first paint: enable CSS reveals only when JS runs and motion is allowed (see Reveal.tsx).
const REVEAL_BOOT = `if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("rv")`;

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const cur = await getTranslations({ locale, namespace: "cursor" });

  return (
    <html
      lang={locale}
      className={`${hanken.variable} ${hankenItalic.variable} ${jetbrains.variable}`}
      // REVEAL_BOOT adds a class to <html> before hydration.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT }} />
      </head>
      <body>
        {/* No NextIntlClientProvider: client components receive their strings as props. */}
        {children}
        <RevealObserver />
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
