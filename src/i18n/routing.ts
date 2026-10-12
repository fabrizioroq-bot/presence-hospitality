import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "nl"],
  defaultLocale: "en",
  localePrefix: "always",
  // Not HttpOnly: next-intl rewrites this cookie from the browser when the visitor switches language.
  localeCookie: { sameSite: "lax", secure: process.env.NODE_ENV === "production" },
  // Internal route → public URL per locale (Dutch URLs are translated).
  pathnames: {
    "/": "/",
    "/solution": { en: "/solution", nl: "/oplossing" },
    "/packages": { en: "/packages", nl: "/pakketten" },
    "/onboarding": "/onboarding",
    "/faq": "/faq",
    "/demo": "/demo",
    "/about": { en: "/about", nl: "/over-ons" },
    "/privacy": "/privacy",
    "/cookies": "/cookies",
  },
});

export type Locale = (typeof routing.locales)[number];
export type Page = keyof typeof routing.pathnames;
