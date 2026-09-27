import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { hanken, hankenItalic, jetbrains } from "@/lib/fonts";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { Grain } from "@/components/brand/Grain";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CursorGlow } from "@/components/ambient/CursorGlow";
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

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${hanken.variable} ${hankenItalic.variable} ${jetbrains.variable}`}
    >
      <body>
        {/* No NextIntlClientProvider: client components receive their strings as props. */}
        <MotionProvider>{children}</MotionProvider>
        <Grain />
        <CursorGlow />
        <SmoothScroll />
        <PageTransition />
      </body>
    </html>
  );
}
