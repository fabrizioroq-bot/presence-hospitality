import { getTranslations } from "next-intl/server";
import { EditorialPhoto } from "@/components/ui/EditorialPhoto";
import { Headline } from "@/components/ui/Headline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { photos } from "@/content/photos";

type Fact = { t: string; d: string };

/**
 * Home 05 (quiet): who answers your guests. No faces or names (client decision): a non-identifiable
 * workplace photo and four facts already stated on the site.
 */
export async function RealPeople() {
  const t = await getTranslations("people");
  const facts = t.raw("facts") as Fact[];
  return (
    <section
      id="people"
      data-mood="mist"
      data-tone="lavender"
      aria-labelledby="people-title"
      className="relative bg-mist-bg py-16 text-ink-900 lg:py-32"
    >
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-6">
        <div className="relative lg:col-span-5">
          <EditorialPhoto
            photo={photos.people}
            alt={t("photoAlt")}
            sizes="(min-width: 1024px) 36vw, 92vw"
            className="aspect-[16/9] lg:aspect-[4/5]"
            position="50% 65%"
          />
          <EditorialPhoto
            photo={photos.peopleDetail}
            alt={t("detailAlt")}
            sizes="220px"
            className="absolute -right-6 -bottom-8 hidden aspect-[3/2] w-[48%] ring-8 ring-mist-bg lg:block"
          />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-6 lg:col-start-7">
          <p className="text-label text-ink-700">{t("eyebrow")}</p>
          <Headline id="people-title" raw={t.raw("title") as string} className="text-display-lg" />
          <Reveal>
            <p className="max-w-[52ch] text-body-lg text-ink-700">{t("body")}</p>
          </Reveal>
          <RevealGroup className="mt-2 grid gap-x-8 gap-y-6 border-t border-line-mist/40 pt-8 sm:grid-cols-2" gap={0.08}>
            {facts.map((f) => (
              <RevealItem key={f.t} className="flex flex-col gap-1">
                <h3 className="text-heading-sm">{f.t}</h3>
                <p className="text-body text-ink-700">{f.d}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
