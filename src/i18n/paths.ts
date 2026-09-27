import { getPathname } from "./navigation";
import { routing, type Locale, type Page } from "./routing";

/** Public URL of an internal page for a locale, e.g. ("nl", "/packages") → "/nl/pakketten". */
export function pagePath(locale: Locale, page: Page, hash?: string) {
  const p = getPathname({ locale, href: page });
  const withPrefix = p.startsWith(`/${locale}`) ? p : `/${locale}${p === "/" ? "" : p}`;
  return hash ? `${withPrefix}#${hash}` : withPrefix;
}

/** hreflang alternates for a page (both locales + x-default → English). */
export function alternates(page: Page) {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, pagePath(l, page)])) as Record<Locale, string>;
  return { languages: { ...languages, "x-default": languages.en } };
}
