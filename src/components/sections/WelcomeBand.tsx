import { getTranslations } from "next-intl/server";
import { MoodTransition } from "@/components/ambient/MoodTransition";
import { ParallaxOrbs } from "@/components/ambient/ParallaxOrbs";
import { Headline } from "@/components/ui/Headline";

/** Night → mist transition carrying the lobby sign from the pitch: "Welcome to your presence." */
export async function WelcomeBand() {
  const t = await getTranslations("welcome");
  return (
    <>
      <MoodTransition from="deep" to="mist" />
      <div data-mood="mist" className="relative isolate overflow-hidden bg-mist-bg py-12 lg:py-28">
        <ParallaxOrbs
          range={50}
          orbs={[
            { color: "sky", size: "min(44vw, 600px)", top: "-40%", left: "8%", opacity: 0.5, dur: 22 },
            { color: "peach", size: "min(22vw, 300px)", bottom: "-30%", right: "18%", opacity: 0.45, dur: 25 },
          ]}
        />
        <Headline as="p" raw={t.raw("line") as string} className="container-site text-center text-display-lg text-ink-900" />
      </div>
    </>
  );
}
