import { getTranslations } from "next-intl/server";
import { AmbientDust } from "@/components/ambient/AmbientDust";
import { LightSweep } from "@/components/ambient/LightSweep";
import { MoodTransition } from "@/components/ambient/MoodTransition";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { ButtonLink } from "@/components/ui/Button";
import { Depth } from "@/components/ui/Depth";
import { Headline } from "@/components/ui/Headline";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { WordRotate } from "@/components/ui/WordRotate";
import { PackagesBoard, type PackageItem } from "./PackagesBoard";

/** Who it's for (role rows + good-fit checklist) and Packages (pitch slide 8). One night block. */
export async function WhoPackages() {
  const w = await getTranslations("who");
  const p = await getTranslations("packages");
  const c = await getTranslations("common");
  const roles = [1, 2, 3].map((i) => ({ title: w(`r${i}Title` as "r1Title"), body: w(`r${i}Body` as "r1Body") }));
  const fit = w.raw("fit") as string[];
  const items = p.raw("items") as PackageItem[];

  return (
    <>
      <MoodTransition from="mist" to="night" />
      <div data-mood="night" className="relative isolate overflow-hidden bg-charcoal-700 text-paper-50">
        <ParallaxOrbs
          range={90}
          orbs={[
            { color: "sky", size: "min(50vw, 700px)", top: "0%", left: "-18%", opacity: 0.16, dur: 23 },
            { color: "mint", size: "min(34vw, 460px)", top: "48%", right: "-10%", opacity: 0.1, dur: 25 },
            { color: "peach", size: "min(26vw, 360px)", bottom: "0%", left: "30%", opacity: 0.1, dur: 21 },
          ]}
        />
        <LightSweep />
        <AmbientDust mood="night" density={0.6} />

        {/* ---------------- Who it's for ---------------- */}
        <section id="who" aria-labelledby="who-title" className="container-site pt-8 pb-24 lg:pt-16 lg:pb-32">
          <p className="text-label text-paper-500">{w("eyebrow")}</p>
          <h2 id="who-title" className="mt-6 text-display-xl">
            {w("lead")}
            <br />
            <WordRotate words={w.raw("roles") as string[]} sr={w("rolesSr")} />
          </h2>

          <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-6">
            <RevealGroup className="flex flex-col lg:col-span-7" gap={0.1}>
              {roles.map((r, i) => (
                <RevealItem key={r.title}>
                  <div className="group grid grid-cols-[3rem_1fr_auto] items-start gap-4 border-b border-line-night py-7 transition-colors duration-300 hover:border-holo-300 lg:py-9">
                    <span className="pt-2 text-label text-paper-500">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-heading-md">{r.title}</h3>
                      <p className="max-w-[46ch] text-body text-paper-300">{r.body}</p>
                    </div>
                    <span
                      aria-hidden
                      className="pt-2 text-holo-300 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                    >
                      →
                    </span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            <Depth range={30} className="lg:col-span-4 lg:col-start-9">
              <Reveal className="rounded-xl border border-line-night p-8">
                <h3 className="text-heading-sm text-paper-50">{w("fitTitle")}</h3>
                <ul className="mt-6 flex flex-col gap-4">
                  {fit.map((f) => (
                    <li key={f} className="flex gap-3 text-body text-paper-300">
                      <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0" fill="none">
                        <circle cx="10" cy="10" r="9" stroke="var(--holo-300)" strokeOpacity="0.6" />
                        <path d="M6 10.5l2.6 2.6L14 7.5" stroke="var(--holo-300)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </Depth>
          </div>
        </section>

        {/* ---------------- Packages ---------------- */}
        <section id="packages" aria-labelledby="packages-title" className="container-site pb-24 lg:pb-40">
          <div className="flex flex-col gap-6">
            <p className="text-label text-paper-500">{p("eyebrow")}</p>
            <Headline id="packages-title" raw={p.raw("title") as string} className="text-display-xl" />
            <Reveal>
              <p className="max-w-[52ch] text-body-lg text-paper-300">{p("sub")}</p>
            </Reveal>
          </div>
          <div className="mt-12 lg:mt-16">
            <PackagesBoard items={items} tabsLabel={p("tabsLabel")} />
          </div>
          <Reveal className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="#demo" mood="night" arrow>
              {c("bookDemo")}
            </ButtonLink>
            <p className="text-body-sm text-paper-500">{p("note")}</p>
          </Reveal>
        </section>
      </div>
    </>
  );
}
