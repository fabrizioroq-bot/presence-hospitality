import { AmbientDust } from "@/components/ambient/AmbientDust";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { HexMotif } from "@/components/brand/HexMotif";
import { AnimatedWords } from "@/components/ui/AnimatedWords";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { splitHeadline } from "@/lib/headline";

/** Compact mist header for subpages: eyebrow + H1 (one italic phrase) + lead. */
export function PageHeader({ eyebrow, h1, sub }: { eyebrow: string; h1: string; sub: string }) {
  return (
    <header data-mood="mist" className="relative isolate overflow-hidden bg-mist-bg pt-[calc(var(--nav-h)+48px)] pb-12 text-ink-900 lg:pt-[calc(var(--nav-h)+96px)] lg:pb-20">
      <ParallaxOrbs
        orbs={[
          { color: "sky", size: "min(60vw, 820px)", top: "-30%", right: "-18%", opacity: 0.7, dur: 24 },
          { color: "peach", size: "min(24vw, 320px)", bottom: "0%", right: "12%", opacity: 0.45, dur: 26 },
          { color: "lavender", size: "min(40vw, 540px)", bottom: "-40%", left: "-14%", opacity: 0.5, dur: 20 },
        ]}
      />
      <HexMotif className="-bottom-24 -left-24 -z-10 w-[420px]" />
      <AmbientDust mood="mist" density={0.4} />
      <div className="container-site flex flex-col gap-6">
        <p className="text-label text-ink-700">{eyebrow}</p>
        <AnimatedWords as="h1" trigger="load" words={splitHeadline(h1)} className="max-w-[16ch] text-display-xl text-balance" />
        <RevealGroup onLoad delay={0.2}>
          <RevealItem soft>
            <p className="max-w-[56ch] text-body-lg text-ink-700">{sub}</p>
          </RevealItem>
        </RevealGroup>
      </div>
    </header>
  );
}
