import { getLocale, getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { EditorialPhoto } from "@/components/ui/EditorialPhoto";
import { Headline } from "@/components/ui/Headline";
import { Reveal } from "@/components/ui/Reveal";
import { photos } from "@/content/photos";
import { pagePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";

/** Home 10 (summary → /packages): start with nights, expand later. */
export async function StartSmall() {
  const t = await getTranslations("startSmall");
  const locale = (await getLocale()) as Locale;
  return (
    <section
      id="start-small"
      data-mood="mist"
      data-tone="ivory"
      aria-labelledby="start-small-title"
      className="relative bg-mist-bg py-16 text-ink-900 lg:py-32"
    >
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-6">
        <EditorialPhoto
          photo={photos.startSmall}
          alt={t("photoAlt")}
          sizes="(min-width: 1024px) 34vw, 92vw"
          className="hidden lg:order-1 lg:col-span-4 lg:block lg:aspect-[3/4]"
          position="50% 40%"
        />
        <div className="order-1 flex flex-col gap-6 lg:order-2 lg:col-span-6 lg:col-start-6">
          <p className="text-label text-ink-700">{t("eyebrow")}</p>
          <Headline id="start-small-title" raw={t.raw("title") as string} className="text-display-lg" />
          <Reveal className="flex flex-col items-start gap-6">
            <p className="max-w-[52ch] text-body-lg text-ink-700">{t("body")}</p>
            <ButtonLink href={pagePath(locale, "/packages")} variant="ghost" arrow>
              {t("more")}
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
