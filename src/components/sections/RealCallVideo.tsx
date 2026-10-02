import { getLocale, getTranslations } from "next-intl/server";
import { Headline } from "@/components/ui/Headline";
import { flags } from "@/content/flags";
import { realCall } from "@/content/media";

/**
 * Home 06: a real, unedited Holobox call. Renders nothing until flags.realCallVideo is on and the
 * video exists (src/content/media.ts). No autoplay with sound; captions in both languages.
 */
export async function RealCallVideo() {
  if (!flags.realCallVideo || !realCall) return null;
  const t = await getTranslations("callVideo");
  const locale = (await getLocale()) as "en" | "nl";
  return (
    <section data-mood="night" aria-labelledby="call-title" className="relative isolate bg-charcoal-700 py-16 text-paper-50 lg:py-28">
      <div className="container-site grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-6">
        <div className="flex flex-col gap-5 lg:col-span-4">
          <p className="text-label text-paper-500">{t("eyebrow")}</p>
          <Headline id="call-title" raw={t.raw("title") as string} className="text-display-lg" />
          <p className="text-body-lg text-paper-300">{t("body")}</p>
          <p className="text-body-sm text-paper-500">{t("captions")}</p>
        </div>
        <video
          className="w-full rounded-xl lg:col-span-8"
          controls
          preload="none"
          playsInline
          poster={realCall.poster}
        >
          <source src={realCall.src} type="video/mp4" />
          <track kind="captions" src={realCall.captions[locale]} srcLang={locale} default />
        </video>
      </div>
    </section>
  );
}
