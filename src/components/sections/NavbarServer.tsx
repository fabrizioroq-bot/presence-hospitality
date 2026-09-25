import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "./Navbar";

export async function NavbarServer() {
  const t = await getTranslations("nav");
  const c = await getTranslations("common");
  const locale = (await getLocale()) as "en" | "nl";
  return (
    <Navbar
      locale={locale}
      labels={{
        links: {
          howItWorks: t("howItWorks"),
          experience: t("experience"),
          packages: t("packages"),
          onboarding: t("onboarding"),
          faq: t("faq"),
        },
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
