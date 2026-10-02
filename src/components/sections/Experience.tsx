import { getTranslations } from "next-intl/server";
import { AmbientDust } from "@/components/ambient/AmbientDust";
import { LightSweep } from "@/components/ambient/LightSweep";
import { MoodTransition } from "@/components/ambient/MoodTransition";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { Headline } from "@/components/ui/Headline";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { NumberRoll } from "@/components/ui/NumberRoll";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { SwipeDots } from "@/components/ui/SwipeDots";
import { cn } from "@/lib/cn";

const orbs = [
  { color: "sky" as const, size: "min(60vw, 820px)", top: "-8%", right: "-20%", opacity: 0.16, dur: 24 },
  { color: "lavender" as const, size: "min(40vw, 560px)", top: "45%", left: "-12%", opacity: 0.1, dur: 22 },
  { color: "peach" as const, size: "min(26vw, 360px)", bottom: "4%", right: "20%", opacity: 0.1, dur: 26 },
];

/** /solution: Behind the box (pitch slide 6) — five cards, 2/2/1 on desktop, a swipe row on mobile. */
export async function BehindTheBox() {
  const b = await getTranslations("behind");
  const c = await getTranslations("common");
  const cards = [1, 2, 3, 4, 5].map((i) => ({
    n: i,
    title: b(`c${i}Title` as "c1Title"),
    body: b(`c${i}Body` as "c1Body"),
    filled: i === 1 || i === 4, // pitch slide 6: 01 and 04 carry the holo gradient
  }));
  return (
    <>
      <MoodTransition from="mist" to="deep" />
      <section id="behind" data-mood="night" aria-labelledby="behind-title" className="relative isolate overflow-hidden bg-night-900 text-paper-50">
        <ParallaxOrbs range={80} orbs={orbs} />
        <LightSweep />
        <AmbientDust mood="night" density={0.6} />
        <div className="container-site pt-6 pb-16 lg:pt-16 lg:pb-40">
          <div className="flex flex-col gap-6">
            <p className="text-label text-paper-500">{b("eyebrow")}</p>
            <Headline id="behind-title" raw={b.raw("title") as string} className="text-display-lg" />
          </div>
          <RevealGroup id="behind-cards" tabIndex={0} className="swipe-row mt-10 lg:mt-12 lg:grid lg:grid-cols-2 lg:gap-6" gap={0.08}>
            {cards.map((card) => (
              <RevealItem key={card.n} className={cn("swipe-item", card.n === 5 && "lg:col-span-2 lg:mx-auto lg:w-[calc(50%-12px)]")}>
                <SpotlightCard
                  tone={card.filled ? "ink" : "holo"}
                  className={cn(
                    "flex h-full flex-col items-start gap-5 rounded-xl p-6 sm:flex-row sm:gap-6 sm:p-8",
                    card.filled ? "bg-holo-gradient text-ink-900" : "border border-line-night text-paper-50",
                  )}
                >
                  <NumberRoll
                    value={card.n}
                    className={cn(
                      "grid h-14 w-14 shrink-0 place-items-center rounded-pill font-mono text-[1.125rem] font-medium tabular-nums sm:h-16 sm:w-16 sm:text-[1.25rem]",
                      card.filled ? "bg-petrol text-paper-50" : "bg-paper-50 text-ink-900",
                    )}
                  />
                  <div className="flex flex-col gap-2 pt-1">
                    <h3 className="text-heading-md">{card.title}</h3>
                    <p className={cn("text-body", card.filled ? "text-ink-700" : "text-paper-300")}>{card.body}</p>
                  </div>
                </SpotlightCard>
              </RevealItem>
            ))}
          </RevealGroup>
          <div className="text-paper-300">
            <SwipeDots target="behind-cards" count={cards.length} label={c("swipeHint")} />
          </div>
        </div>
      </section>
    </>
  );
}
