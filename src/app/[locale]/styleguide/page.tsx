import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { MistOrbs } from "@/components/brand/MistOrbs";
import { HexMotif } from "@/components/brand/HexMotif";
import { Button, ButtonLink } from "@/components/ui/Button";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

// Dev-only reference of every token, type style, button, panel and motion preset.
// Strings here are intentionally not translated.

const mistSwatches = [
  ["--mist-bg", "#D3DAE1"],
  ["--mist-surface", "#E4E9EE"],
  ["--mist-raised", "#F2F5F8"],
  ["--ink-900", "#1D1F23"],
  ["--ink-700", "#3E4046"],
  ["--ink-500", "#5A5E66"],
  ["--line-mist", "#636870"],
  ["--link-mist", "#1C5AA0"],
];
const nightSwatches = [
  ["--night-900", "#121417"],
  ["--night-800", "#1B1D21"],
  ["--charcoal-700", "#2F3136"],
  ["--paper-50", "#F4F6F8"],
  ["--paper-300", "#C5CAD1"],
  ["--paper-500", "#A3AAB4"],
  ["--line-night", "#7C838E"],
];
const accentSwatches = [
  ["--holo-100", "#E6F2FF"],
  ["--holo-300", "#BFE0FF"],
  ["--holo-400", "#8CC4FF"],
  ["--holo-500", "#5AA8F5"],
  ["--holo-600", "#2F7FD0"],
  ["--amber-300", "#F8C98B"],
  ["--amber-400", "#F5A94A"],
  ["--orb-sky", "#8DB3DF"],
  ["--orb-mint", "#BEE6DA"],
  ["--orb-lavender", "#D6C6E4"],
  ["--orb-peach", "#F1C7A3"],
];

const typeScale = [
  ["text-display-2xl", "Stop hiring"],
  ["text-display-xl", "The problem"],
  ["text-display-lg", "Behind the box"],
  ["text-heading-md", "Holobox installation"],
  ["text-heading-sm", "Operations managers"],
  ["text-caps", "Structural cost pressure"],
  [
    "text-body-lg",
    "Presence Hospitality runs your reception from one central hub.",
  ],
  [
    "text-body",
    "Guests check in on their own, and when they need someone, a receptionist appears.",
  ],
  ["text-body-sm", "Illustrative shape, not measured data."],
  ["text-label", "Agent online · 01 02 03"],
];

function Swatch({
  name,
  hex,
  dark = false,
}: {
  name: string;
  hex: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 rounded-md ring-1 ring-black/10"
        style={{ background: `var(${name})` }}
      />
      <div className={dark ? "text-paper-300" : "text-ink-700"}>
        <div className="text-label">{name}</div>
        <div className="text-body-sm">{hex}</div>
      </div>
    </div>
  );
}

export default async function StyleguidePage({
  params,
}: PageProps<"/[locale]/styleguide">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      {/* Mist */}
      <section
        data-mood="mist"
        className="relative overflow-hidden section-pad"
      >
        <MistOrbs
          orbs={[
            {
              color: "sky",
              size: "60vw",
              top: "-10%",
              right: "-15%",
              opacity: 0.75,
            },
            {
              color: "peach",
              size: "22vw",
              top: "35%",
              right: "8%",
              opacity: 0.55,
              dur: 26,
            },
            {
              color: "lavender",
              size: "35vw",
              bottom: "-15%",
              left: "-10%",
              opacity: 0.6,
              dur: 19,
            },
          ]}
        />
        <HexMotif className="-bottom-10 -left-16 w-[420px]" />
        <div className="relative container-site flex flex-col gap-24">
          <header className="flex flex-col gap-6">
            <p className="text-label text-ink-500">
              Presence design system · dev only
            </p>
            <Logo />
            <div className="flex items-center gap-6">
              <LogoMark className="h-12 w-12" />
              <LogoMark className="h-8 w-8" />
              <LogoMark className="h-4 w-4" />
            </div>
          </header>

          <div className="flex flex-col gap-8">
            <h2 className="text-display-lg">Colour — mist</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">
              {mistSwatches.map(([n, h]) => (
                <Swatch key={n} name={n} hex={h} />
              ))}
            </div>
            <h2 className="text-display-lg">Colour — accents</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-6">
              {accentSwatches.map(([n, h]) => (
                <Swatch key={n} name={n} hex={h} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h2 className="text-display-lg">
              Type — Hanken Grotesk + JetBrains Mono
            </h2>
            <div className="flex flex-col gap-8">
              {typeScale.map(([cls, sample]) => (
                <div
                  key={cls}
                  className="grid gap-2 border-t border-line-mist/30 pt-4 lg:grid-cols-[220px_1fr]"
                >
                  <span className="text-label text-ink-500">{cls}</span>
                  <span className={cls}>
                    {cls === "text-display-2xl" ? (
                      <>
                        Stop hiring <em className="emph">front desk</em> staff.
                      </>
                    ) : (
                      sample
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h2 className="text-display-lg">Buttons — mist</h2>
            <div className="flex flex-wrap items-center gap-4">
              <ButtonLink href="#" arrow>
                Book a demo
              </ButtonLink>
              <Button variant="glow">Glow secondary</Button>
              <Button variant="ghost">See how it works</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h2 className="text-display-lg">
              Outlined panel (pitch signature)
            </h2>
            <div className="grid rounded-xl border border-line-mist lg:grid-cols-3">
              {[
                "One-time setup",
                "Monthly service fee",
                "Variable component",
              ].map((t, i) => (
                <div
                  key={t}
                  className={
                    "flex flex-col gap-4 p-8 lg:p-10 " +
                    (i > 0
                      ? "border-t border-line-mist lg:border-t-0 lg:border-l"
                      : "")
                  }
                >
                  <span className="h-5 w-5 rounded-full bg-holo-gradient ring-1 ring-ink-900/10" />
                  <h3 className="text-heading-md">{t}</h3>
                  <p className="text-body text-ink-700">
                    Column separated by a 1px divider. Radius 48px, stroke
                    --line-mist.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h2 className="text-display-lg">Motion — reveal + stagger</h2>
            <RevealGroup className="grid gap-4 sm:grid-cols-4">
              {["01", "02", "03", "04"].map((n) => (
                <RevealItem
                  key={n}
                  className="flex h-32 items-end rounded-lg bg-mist-surface p-6 ring-1 ring-line-mist/40"
                >
                  <span className="text-label">
                    {n} · y 24 → 0 · blur 6 → 0
                  </span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* Night */}
      <section
        data-mood="night"
        className="relative overflow-hidden section-pad"
      >
        <MistOrbs
          orbs={[
            {
              color: "sky",
              size: "50vw",
              top: "-20%",
              right: "-10%",
              opacity: 0.22,
            },
            {
              color: "peach",
              size: "30vw",
              bottom: "-10%",
              left: "10%",
              opacity: 0.14,
            },
          ]}
        />
        <div className="relative container-site flex flex-col gap-24">
          <div className="flex flex-col gap-8">
            <h2 className="text-display-lg">Colour — night</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-7">
              {nightSwatches.map(([n, h]) => (
                <Swatch key={n} name={n} hex={h} dark />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h2 className="text-display-lg">
              Not a video call. <em className="emph">A presence.</em>
            </h2>
            <p className="max-w-[52ch] text-body-lg text-paper-300">
              Secondary text on charcoal. Captions use paper-500.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ButtonLink href="#" mood="night" arrow>
                Book a demo
              </ButtonLink>
              <Button mood="night" variant="glow">
                Glow secondary
              </Button>
              <Button mood="night" variant="ghost">
                Ghost
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h2 className="text-display-lg">HUD + portal</h2>
            <div className="relative aspect-[3/4.4] w-full max-w-sm overflow-hidden rounded-xl bg-night-900 shadow-glow-holo">
              <div className="absolute inset-x-6 top-6 flex justify-between text-label text-paper-300">
                <span className="inline-flex items-center gap-2">
                  <span className="live-dot" /> Agent online
                </span>
                <span>Hub → Lobby</span>
              </div>
              <div className="absolute inset-x-6 bottom-6 text-label text-paper-300">
                Live · 4K telepresence
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Logo onNight />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h2 className="text-display-lg">Package pills</h2>
            <div className="flex flex-wrap items-center gap-4">
              {["Night-Only", "Day + Evening", "24/7 Premium", "Add-ons"].map(
                (p) => (
                  <span
                    key={p}
                    className="rounded-pill bg-holo-gradient px-6 py-3 text-heading-sm text-ink-900 font-extrabold"
                  >
                    {p}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
