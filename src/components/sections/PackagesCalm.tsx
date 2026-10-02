import { getLocale, getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { pagePath } from "@/i18n/paths";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

type PackageItem = { name: string; points: string[] };
type Role = { title: string; body: string };

const Check = () => (
  <svg aria-hidden viewBox="0 0 20 20" className="mt-1 h-5 w-5 shrink-0" fill="none">
    <circle cx="10" cy="10" r="9" stroke="var(--ph-brand-primary)" strokeOpacity="0.45" />
    <path d="M6 10.5l2.6 2.6L14 7.5" stroke="var(--ph-brand-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * /packages, deliberately calm (Visual Trust brief): three packages with an explicit scope, Night-Only
 * marked as where many hotels start, add-ons apart, then who it's for. Light, large type, little motion.
 */
export async function PackagesCalm() {
  const p = await getTranslations("packages");
  const w = await getTranslations("who");
  const c = await getTranslations("common");
  const locale = (await getLocale()) as Locale;
  const items = p.raw("items") as PackageItem[];
  const [addons, ...packages] = [items[3], ...items.slice(0, 3)];
  const roles: Role[] = [1, 2, 3].map((i) => ({ title: w(`r${i}Title` as "r1Title"), body: w(`r${i}Body` as "r1Body") }));
  const fit = w.raw("fit") as string[];

  return (
    <>
      <section id="packages" data-mood="mist" data-tone="ivory" aria-label={p("tabsLabel")} className="relative bg-mist-bg pb-16 text-ink-900 lg:pb-28">
        <div className="container-site flex flex-col gap-10">
          <RevealGroup className="grid gap-6 lg:grid-cols-3" gap={0.1}>
            {packages.map((pkg, i) => (
              <RevealItem
                key={pkg.name}
                className={cn("flex flex-col gap-6 rounded-xl bg-mist-surface p-7 lg:p-9", i === 0 && "outline-2 outline-solid outline-petrol")}
              >
                <div className="flex flex-col items-start gap-3">
                  {i === 0 && (
                    <span className="rounded-pill bg-petrol px-3 py-1.5 text-body-sm font-semibold text-paper-50">{p("startHere")}</span>
                  )}
                  <h2 className="text-heading-md">{pkg.name}</h2>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="text-body-sm font-semibold text-ink-500">{p("includes")}</p>
                  <ul className="flex flex-col gap-3">
                    {pkg.points.map((pt) => (
                      <li key={pt} className="flex gap-3 text-body text-ink-700">
                        <Check />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal className="flex flex-col gap-4 rounded-xl border border-line-mist/50 p-7 lg:flex-row lg:items-baseline lg:gap-10 lg:p-9">
            <h2 className="shrink-0 text-heading-sm">{p("addonsTitle")}</h2>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-body text-ink-700">
              {addons.points.map((pt) => (
                <li key={pt} className="flex items-center gap-3">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-teal" />
                  {pt}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <ButtonLink href={pagePath(locale, "/demo")} arrow>
              {c("bookDemo")}
            </ButtonLink>
            <p className="text-body text-ink-700">{p("note")}</p>
          </div>
        </div>
      </section>

      <section id="who" data-mood="mist" data-tone="ivory" aria-labelledby="who-title" className="relative bg-mist-bg pb-16 text-ink-900 lg:pb-28">
        <div className="container-site grid gap-10 border-t border-line-mist/40 pt-16 lg:grid-cols-12 lg:gap-6 lg:pt-24">
          <div className="flex flex-col gap-8 lg:col-span-7">
            <div className="flex flex-col gap-4">
              <p className="text-label text-ink-700">{w("eyebrow")}</p>
              <h2 id="who-title" className="text-display-lg">
                {w("lead")} {w("rolesSr")}
              </h2>
            </div>
            <dl className="flex flex-col">
              {roles.map((r) => (
                <div key={r.title} className="grid gap-1 border-b border-line-mist/40 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
                  <dt className="text-heading-sm">{r.title}</dt>
                  <dd className="text-body text-ink-700">{r.body}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="self-start rounded-xl bg-mist-surface p-7 lg:col-span-4 lg:col-start-9 lg:p-9">
            <h3 className="text-heading-sm">{w("fitTitle")}</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {fit.map((f) => (
                <li key={f} className="flex gap-3 text-body text-ink-700">
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
