import { getLocale, getTranslations } from "next-intl/server";
import { legal } from "@/content/legal";
import { site } from "@/content/site";
import { pagePath } from "@/i18n/paths";
import type { Locale, Page } from "@/i18n/routing";

/** BreadcrumbList for a subpage: Presence Hospitality (home) → page. Names are the page titles before " | ". */
export async function BreadcrumbJsonLd({ page }: { page: Exclude<Page, "/"> }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("pages");
  const title =
    page === "/privacy" || page === "/cookies"
      ? legal[locale][page.slice(1) as "privacy" | "cookies"].title
      : t(`${page.slice(1) as "solution"}.title`).split(" | ")[0];
  const abs = (p: string) => `${site.domainUrl}${p}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: site.name, item: abs(pagePath(locale, "/")) },
      { "@type": "ListItem", position: 2, name: title, item: abs(pagePath(locale, page)) },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
