import type { Metadata } from "next";
import { alternates, pagePath } from "@/i18n/paths";
import type { Locale, Page } from "@/i18n/routing";

/** Share image per locale (1200×630, scripts/generate-brand-assets.mjs). */
const ogImage = (locale: Locale) => ({ url: `/og/presence-hospitality-${locale}.png`, width: 1200, height: 630, alt: "Presence Hospitality" });

/** Per-page metadata: title, description, canonical + hreflang (localized URLs), Open Graph and share image. */
export function pageMeta(locale: Locale, page: Page, title: string, description: string): Metadata {
  const url = pagePath(locale, page);
  const image = ogImage(locale);
  return {
    title,
    description,
    alternates: { canonical: url, ...alternates(page) },
    openGraph: {
      type: "website",
      siteName: "Presence Hospitality",
      title,
      description,
      url,
      locale: locale === "nl" ? "nl_NL" : "en_GB",
      alternateLocale: locale === "nl" ? ["en_GB"] : ["nl_NL"],
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}
