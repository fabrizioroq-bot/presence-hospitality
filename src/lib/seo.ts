import type { Metadata } from "next";
import { alternates, pagePath } from "@/i18n/paths";
import type { Locale, Page } from "@/i18n/routing";

/** Per-page metadata: title, description, canonical + hreflang (localized URLs) and Open Graph. */
export function pageMeta(locale: Locale, page: Page, title: string, description: string): Metadata {
  const url = pagePath(locale, page);
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
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
