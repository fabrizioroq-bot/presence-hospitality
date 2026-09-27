import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "nl"],
  defaultLocale: "en",
  localePrefix: "always",
  // Internal route → public URL per locale (Dutch URLs are translated).
  pathnames: {
    "/": "/",
    "/solution": { en: "/solution", nl: "/oplossing" },
    "/packages": { en: "/packages", nl: "/pakketten" },
    "/onboarding": "/onboarding",
    "/faq": "/faq",
    "/demo": "/demo",
    "/privacy": "/privacy",
    "/cookies": "/cookies",
  },
});

export type Locale = (typeof routing.locales)[number];
export type Page = keyof typeof routing.pathnames;
