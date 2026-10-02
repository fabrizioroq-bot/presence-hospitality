import { getLocale, getTranslations } from "next-intl/server";
import { AmbientDust } from "@/components/ambient/AmbientDust";
import { LightSweep } from "@/components/ambient/LightSweep";
import { MoodTransition } from "@/components/ambient/MoodTransition";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { DemoForm, type DemoFormLabels } from "@/components/demo/DemoForm";
import { Headline } from "@/components/ui/Headline";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/content/site";
import { PhoneLinks } from "@/components/ui/PhoneLinks";

/** Book a demo: pitch + reassurance on the left, the form card on the right. Night. */
export async function Demo({ asPage = false }: { asPage?: boolean } = {}) {
  const t = await getTranslations("demo");
  const locale = (await getLocale()) as "en" | "nl";
  const labels: DemoFormLabels = {
    f: t.raw("f") as DemoFormLabels["f"],
    ph: t.raw("ph") as DemoFormLabels["ph"],
    positions: t.raw("positions") as DemoFormLabels["positions"],
    pmsNotSure: t("pmsNotSure"),
    chars: t.raw("chars") as string,
    submit: t("submit"),
    sending: t("sending"),
    errors: t.raw("errors") as DemoFormLabels["errors"],
    summary: t("summary"),
    server: t.raw("server") as string,
    rate: t("rate"),
    successTitle: t("successTitle"),
    successBody: t.raw("successBody") as string,
  };
  const consentLabel = t.rich("f.consent", {
    link: (chunks) => (
      <a href={`/${locale}/privacy`} target="_blank" rel="noopener">
        {chunks}
      </a>
    ),
  });
  const reassure = t.raw("reassure") as string[];

  return (
    <>
      {!asPage && <MoodTransition from="mist" to="night" />}
      <section
        id="demo"
        data-mood="night"
        aria-labelledby="demo-title"
        className={`relative isolate overflow-x-clip bg-charcoal-700 text-paper-50 ${asPage ? "pt-[calc(var(--nav-h)+40px)] pb-16 lg:pt-[calc(var(--nav-h)+80px)] lg:pb-32" : "pt-8 pb-24 lg:pb-40"}`}
      >
        <ParallaxOrbs
          range={80}
          orbs={[
            { color: "sky", size: "min(50vw, 700px)", top: "0%", right: "-16%", opacity: 0.2, dur: 24 },
            { color: "peach", size: "min(30vw, 420px)", bottom: "0%", left: "-6%", opacity: 0.14, dur: 22 },
          ]}
        />
        <LightSweep />
        <AmbientDust mood="night" density={0.5} />

        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <div className="flex flex-col gap-6">
              <p className="text-label text-paper-500">{t("eyebrow")}</p>
              <Headline as={asPage ? "h1" : "h2"} id="demo-title" raw={t.raw("title") as string} className="text-display-xl lg:text-display-lg" />
              <Reveal>
                <p className="max-w-[44ch] text-body-lg text-paper-300">{t("sub")}</p>
              </Reveal>
            </div>
            <Reveal>
              <ul className="flex flex-col gap-3">
                {reassure.map((r) => (
                  <li key={r} className="flex gap-3 text-body text-paper-50">
                    <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="var(--ph-accent-on-dark)" strokeOpacity="0.6" />
                      <path d="M6 10.5l2.6 2.6L14 7.5" stroke="var(--ph-accent-on-dark)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {r}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="flex items-center gap-5 border-t border-line-night/50 pt-8">
              {/* Mini Holobox outline with the live dot */}
              <svg aria-hidden viewBox="0 0 40 64" className="h-16 w-10 shrink-0" fill="none">
                <rect x="1" y="1" width="38" height="62" rx="10" stroke="var(--holo-400)" strokeOpacity="0.7" />
                <circle cx="20" cy="22" r="4" stroke="var(--holo-300)" />
                <path d="M13 50v-12c0-4 3-7 7-7s7 3 7 7v12" stroke="var(--holo-300)" />
                <circle cx="31" cy="9" r="2.5" fill="var(--ph-live)" />
              </svg>
              <div className="flex flex-col gap-1 text-body">
                <span className="text-paper-300">{t("contactLead")}</span>
                <PhoneLinks
                  labelClassName="text-paper-300"
                  linkClassName="w-fit text-paper-50 underline decoration-line-night underline-offset-4 hover:decoration-paper-50"
                />
                <a href={`mailto:${site.email}`} className="w-fit break-all text-paper-50 underline decoration-line-night underline-offset-4 hover:decoration-paper-50">
                  {site.email}
                </a>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="shine-focus rounded-xl border border-line-night bg-night-800 p-6 sm:p-10 lg:p-12">
              <DemoForm locale={locale} labels={labels} consentLabel={consentLabel} contactEmail={site.email} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
