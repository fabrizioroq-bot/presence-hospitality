import { getLocale, getTranslations } from "next-intl/server";
import { pagePath } from "@/i18n/paths";
import type { Locale, Page } from "@/i18n/routing";
import { Navbar, type NavLink } from "./Navbar";

/** Builds localized links for the current page and renders the client navbar. */
export async function NavbarServer({ page }: { page: Page }) {
  const t = await getTranslations("nav");
  const c = await getTranslations("common");
  const locale = (await getLocale()) as Locale;
  const other: Locale = locale === "en" ? "nl" : "en";
  const onHome = page === "/";
  const links: NavLink[] = [
    { key: "howItWorks", label: t("howItWorks"), href: pagePath(locale, "/", "how-it-works"), sectionId: onHome ? "how-it-works" : undefined },
    { key: "solution", label: t("solution"), href: pagePath(locale, "/solution") },
    { key: "packages", label: t("packages"), href: pagePath(locale, "/packages") },
    { key: "onboarding", label: t("onboarding"), href: pagePath(locale, "/onboarding") },
    { key: "faq", label: t("faq"), href: pagePath(locale, "/faq") },
  ];
  const activeKey = ({ "/solution": "solution", "/packages": "packages", "/onboarding": "onboarding", "/faq": "faq" } as Partial<Record<Page, string>>)[page] ?? null;
  return (
    <Navbar
      locale={locale}
      links={links}
      activeKey={activeKey}
      homeHref={pagePath(locale, "/")}
      demoHref={pagePath(locale, "/demo")}
      switchHref={pagePath(other, page)}
      labels={{
        skip: c("skip"),
        bookDemo: c("bookDemo"),
        switchLocale: c("switchLocale"),
        menuOpen: c("menuOpen"),
        menuClose: c("menuClose"),
        primaryNav: c("primaryNav"),
        mobileMenu: c("mobileMenu"),
      }}
    />
  );
}
