import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Footer } from "@/components/sections/Footer";
import { NavbarServer } from "@/components/sections/NavbarServer";
import { pagePath } from "@/i18n/paths";
import type { Locale, Page } from "@/i18n/routing";
import { StickyCta } from "./StickyCta";

/** Navbar + main + sticky mobile CTA + footer, shared by every public page. */
export async function PageShell({ page, children }: { page: Page; children: ReactNode }) {
  const locale = (await getLocale()) as Locale;
  const c = await getTranslations("common");
  return (
    <>
      <NavbarServer page={page} />
      <main id="main" tabIndex={-1} className="outline-none">{children}</main>
      {page !== "/demo" && <StickyCta href={pagePath(locale, "/demo")} label={c("stickyCta")} />}
      <Footer />
    </>
  );
}
