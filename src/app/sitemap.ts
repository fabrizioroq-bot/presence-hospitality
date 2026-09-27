import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { pagePath } from "@/i18n/paths";
import { routing, type Page } from "@/i18n/routing";

const PAGES: { page: Page; priority: number }[] = [
  { page: "/", priority: 1 },
  { page: "/solution", priority: 0.8 },
  { page: "/packages", priority: 0.8 },
  { page: "/onboarding", priority: 0.6 },
  { page: "/faq", priority: 0.6 },
  { page: "/demo", priority: 0.9 },
  { page: "/privacy", priority: 0.2 },
  { page: "/cookies", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const abs = (p: string) => new URL(p, site.url).toString();
  return PAGES.flatMap(({ page, priority }) =>
    routing.locales.map((locale) => ({
      url: abs(pagePath(locale, page)),
      changeFrequency: "monthly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, abs(pagePath(l, page))])),
      },
    })),
  );
}
