import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { alternates, pagePath } from "@/i18n/paths";
import { routing, type Page } from "@/i18n/routing";

export const PAGES: { page: Page; priority: number }[] = [
  { page: "/", priority: 1 },
  { page: "/solution", priority: 0.8 },
  { page: "/packages", priority: 0.8 },
  { page: "/onboarding", priority: 0.6 },
  { page: "/faq", priority: 0.6 },
  { page: "/demo", priority: 0.9 },
  { page: "/about", priority: 0.7 },
  { page: "/privacy", priority: 0.2 },
  { page: "/cookies", priority: 0.2 },
];

/** Every public page in both locales, on the domain, with hreflang alternates (+ x-default). */
export default function sitemap(): MetadataRoute.Sitemap {
  const abs = (p: string) => new URL(p, site.domainUrl).toString();
  // The sitemap is static: lastModified is the build (= deploy) date.
  const lastModified = new Date();
  return PAGES.flatMap(({ page, priority }) =>
    routing.locales.map((locale) => ({
      url: abs(pagePath(locale, page)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(Object.entries(alternates(page).languages).map(([l, p]) => [l, abs(p)])),
      },
    })),
  );
}
