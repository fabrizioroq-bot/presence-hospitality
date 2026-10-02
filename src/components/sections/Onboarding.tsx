import { getTranslations } from "next-intl/server";
import { HexMotif } from "@/components/brand/HexMotif";
import { stepIcons } from "@/components/onboarding/StepIcons";
import { EditorialPhoto } from "@/components/ui/EditorialPhoto";
import { Headline } from "@/components/ui/Headline";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { photos } from "@/content/photos";

type OnboardingStep = { title: string; body: string; get: string };

/** Onboarding (calm page): "Nothing changes until everything works." 01 → 06 + go-live checklist + first KPIs. */
export async function Onboarding({ asPage = false }: { asPage?: boolean } = {}) {
  const H = asPage ? "h2" : "h3";
  const t = await getTranslations("onboarding");
  const steps = t.raw("steps") as OnboardingStep[];
  const ready = t.raw("ready") as string[];
  const kpis = t.raw("kpis") as string[];
  return (
    <section
      id="onboarding"
      data-mood="mist"
      aria-labelledby="onboarding-title"
      className={`relative isolate overflow-x-clip bg-mist-bg text-ink-900 ${asPage ? "pt-[calc(var(--nav-h)+40px)] pb-16 lg:pt-[calc(var(--nav-h)+48px)] lg:pb-32" : "py-16 lg:py-32"}`}
    >
      <HexMotif className="right-0 bottom-0 -z-10 w-[420px] rotate-180" />

      <div className="container-site">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-6">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <p className="text-label text-ink-700">{t("eyebrow")}</p>
            <Headline as={asPage ? "h1" : "h2"} id="onboarding-title" raw={t.raw("title") as string} className="max-w-[16ch] text-display-lg" />
            <p className="max-w-[52ch] text-body-lg text-ink-700">{t("sub")}</p>
          </div>
          <EditorialPhoto
            photo={photos.onboarding}
            alt={t("photoAlt")}
            sizes="(min-width: 1024px) 30vw, 92vw"
            className="hidden aspect-[4/3] lg:col-span-4 lg:col-start-9 lg:block"
            position="50% 45%"
          />
        </div>

        {/* A clean 01 → 06 sequence: static, calm, readable (no pinned scroll on this page). */}
        <RevealGroup as="ol" className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-6" gap={0.06}>
          {steps.map((s, i) => (
            <RevealItem as="li" key={s.title} className="flex flex-col gap-4 rounded-lg bg-mist-surface p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-pill bg-petrol text-label text-paper-50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span aria-hidden className="text-ink-500">
                  {stepIcons[i]}
                </span>
              </div>
              <H className="text-heading-sm font-extrabold">{s.title}</H>
              <p className="text-body text-ink-700">{s.body}</p>
              <p className="mt-auto border-t border-line-mist/40 pt-4 text-body-sm">
                <span className="block text-ink-500">{t("youGet")}</span>
                <span className="mt-1 block font-semibold text-ink-900">{s.get}</span>
              </p>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-16 lg:mt-24">
          <RevealGroup className="grid gap-6 lg:grid-cols-2" gap={0.1}>
            <RevealItem className="rounded-xl border border-line-mist p-8">
              <H className="text-heading-sm font-extrabold">{t("readyTitle")}</H>
              <ul className="mt-6 flex flex-col gap-3">
                {ready.map((r) => (
                  <li key={r} className="flex gap-3 text-body text-ink-700">
                    <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="var(--ink-900)" strokeOpacity="0.5" />
                      <path d="M6 10.5l2.6 2.6L14 7.5" stroke="var(--ink-900)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </RevealItem>
            <RevealItem className="rounded-xl border border-line-mist p-8">
              <H className="text-heading-sm font-extrabold">{t("kpiTitle")}</H>
              <ul className="mt-6 flex flex-wrap gap-3">
                {kpis.map((k) => (
                  <li key={k} className="rounded-pill bg-mist-raised px-4 py-2 text-label text-ink-900 ring-1 ring-line-mist/70">
                    {k}
                  </li>
                ))}
              </ul>
            </RevealItem>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
