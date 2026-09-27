import { getTranslations } from "next-intl/server";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { Accordion } from "@/components/faq/Accordion";
import { Headline } from "@/components/ui/Headline";
import { Reveal } from "@/components/ui/Reveal";
import { faq } from "@/content/faq";
import { site } from "@/content/site";
import { PhoneLinks } from "@/components/ui/PhoneLinks";

/** FAQ: sticky intro + contact on the left, single-open accordion on the right. Mist. */
export async function Faq({ asPage = false }: { asPage?: boolean } = {}) {
  const t = await getTranslations("faq");
  const items = faq
    .filter((f) => f.enabled)
    .map((f) => ({ id: f.id, q: t(`items.${f.id}.q` as "items.pms.q"), a: t(`items.${f.id}.a` as "items.pms.a") }));

  return (
    <section
      id="faq"
      data-mood="mist"
      aria-labelledby="faq-title"
      className={`relative isolate overflow-x-clip bg-mist-bg text-ink-900 ${asPage ? "pt-[calc(var(--nav-h)+40px)] pb-16 lg:pt-[calc(var(--nav-h)+96px)] lg:pb-32" : "pt-8 pb-24 lg:pb-40"}`}
    >
      <ParallaxOrbs
        orbs={[
          { color: "peach", size: "min(30vw, 420px)", top: "20%", left: "-8%", opacity: 0.45, dur: 24 },
          { color: "sky", size: "min(40vw, 560px)", bottom: "-10%", right: "-10%", opacity: 0.45, dur: 22 },
        ]}
      />
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <div className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--nav-h)+48px)]">
            <p className="text-label text-ink-700">{t("eyebrow")}</p>
            <Headline as={asPage ? "h1" : "h2"} id="faq-title" raw={t.raw("title") as string} className="text-display-xl" />
            <Reveal className="flex flex-col gap-4">
              <p className="text-heading-sm">{t("still")}</p>
              <p className="max-w-[32ch] text-body text-ink-700">{t("stillBody")}</p>
              <p className="flex flex-col gap-1 text-body">
                <PhoneLinks
                  labelClassName="text-ink-700"
                  linkClassName="w-fit text-link-mist underline decoration-1 underline-offset-4 hover:decoration-2"
                />
                <a href={`mailto:${site.email}`} className="w-fit break-all text-link-mist underline decoration-1 underline-offset-4 hover:decoration-2">
                  {site.email}
                </a>
              </p>
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <Accordion items={items} headingLevel={asPage ? "h2" : "h3"} />
        </div>
      </div>
    </section>
  );
}
