import { routing, type Locale, type Page } from "./routing";

/**
 * Public URL of an internal page for a locale, e.g. ("nl", "/packages") → "/nl/pakketten".
 * Resolved from `routing.pathnames` directly (next-intl's createNavigation would pull its client
 * Link into every page bundle).
 */
export function pagePath(locale: Locale, page: Page, hash?: string) {
  const entry = routing.pathnames[page] as string | Record<Locale, string>;
  const localized = typeof entry === "string" ? entry : entry[locale];
  const path = `/${locale}${localized === "/" ? "" : localized}`;
  return hash ? `${path}#${hash}` : path;
}

/** hreflang alternates for a page (both locales + x-default → English). */
export function alternates(page: Page) {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, pagePath(l, page)])) as Record<Locale, string>;
  return { languages: { ...languages, "x-default": languages.en } };
}
