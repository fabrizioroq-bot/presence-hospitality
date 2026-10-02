import { getLocale, getTranslations } from "next-intl/server";
import { EditorialPhoto } from "@/components/ui/EditorialPhoto";
import { Headline } from "@/components/ui/Headline";
import { caseStudy } from "@/content/case-study";
import { flags } from "@/content/flags";

/**
 * Home 08: one real hotel, one owner, real outcomes. Renders nothing until flags.caseStudy is on and
 * src/content/case-study.ts holds a pilot that agreed to be named.
 */
export async function CaseStudy() {
  if (!flags.caseStudy || !caseStudy) return null;
  const t = await getTranslations("caseStudy");
  const locale = (await getLocale()) as "en" | "nl";
  const cs = caseStudy;
  return (
    <section data-mood="mist" aria-labelledby="case-title" className="relative bg-mist-bg py-16 text-ink-900 lg:py-32">
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-6 lg:col-span-6">
          <p className="text-label text-ink-700">{t("eyebrow")}</p>
          <Headline id="case-title" raw={t.raw("title") as string} className="text-display-lg" />
          <p className="text-heading-sm">
            {cs.hotel}, {cs.city} · {cs.rooms} · {cs.coverage[locale]}
          </p>
          <blockquote className="border-l-2 border-teal pl-5 text-body-lg text-ink-700">
            <p>“{cs.quote[locale]}”</p>
            <footer className="mt-2 text-body-sm text-ink-500">{cs.quoteBy}</footer>
          </blockquote>
          <dl className="grid grid-cols-2 gap-6">
            {cs.metrics.map((m) => (
              <div key={m.value + m.label.en} className="flex flex-col gap-1">
                <dt className="text-body-sm text-ink-500">{m.label[locale]}</dt>
                <dd className="key-figure text-display-lg">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <EditorialPhoto photo={cs.photo} alt={cs.hotel} sizes="(min-width: 1024px) 40vw, 92vw" className="aspect-[4/3] lg:col-span-5 lg:col-start-8" />
      </div>
    </section>
  );
}
