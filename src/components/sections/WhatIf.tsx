import { getLocale, getTranslations } from "next-intl/server";
import { Headline } from "@/components/ui/Headline";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { pagePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

type Item = { q: string; a: string };

/** Home 09 (quiet): the failure questions, answered only with what the service already commits to. */
export async function WhatIf() {
  const t = await getTranslations("whatIf");
  const locale = (await getLocale()) as Locale;
  const items = t.raw("items") as Item[];
  return (
    <section
      id="what-if"
      data-mood="mist"
      data-tone="lavender"
      aria-labelledby="what-if-title"
      className="relative bg-mist-bg py-16 text-ink-900 lg:py-32"
    >
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <p className="text-label text-ink-700">{t("eyebrow")}</p>
          <Headline id="what-if-title" raw={t.raw("title") as string} className="text-display-lg" />
          <p className="max-w-[40ch] text-body-lg text-ink-700">{t("sub")}</p>
          <a href={pagePath(locale, "/faq")} className="w-fit text-body font-semibold text-link-mist underline underline-offset-4">
            {t("more")} <span aria-hidden>→</span>
          </a>
        </div>
        {/* Phones: large accordions (short page); tablet and desktop: every answer visible. */}
        <div className="flex flex-col border-t border-line-mist/40 sm:hidden">
          {items.map((it) => (
            <details key={it.q} className="group border-b border-line-mist/40">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-heading-sm text-petrol [&::-webkit-details-marker]:hidden">
                {it.q}
                <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-pill ring-1 ring-line-mist transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-5 text-body text-ink-700">{it.a}</p>
            </details>
          ))}
        </div>
        <RevealGroup className="hidden gap-4 sm:grid sm:grid-cols-2 lg:col-span-8" gap={0.08}>
          {items.map((it) => (
            <RevealItem key={it.q} className="flex flex-col gap-3 rounded-lg bg-mist-surface p-6 lg:p-8">
              <h3 className="text-heading-sm text-petrol">{it.q}</h3>
              <p className="text-body text-ink-700">{it.a}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
