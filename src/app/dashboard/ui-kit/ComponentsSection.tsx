import { claims } from "@/content/claims";
import { Button } from "@/components/ui/Button";
import { Card, CardColumns } from "@/components/ui/Card";
import { Chip, NumberBadge, Pill } from "@/components/ui/Labels";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Footnote, Stat } from "@/components/ui/Stat";
import { DURATION, EASING } from "@/lib/motion-tokens";
import { ContextGrid, KitSection, KitSub } from "./ContextGrid";
import { MotionDemo } from "./MotionDemo";

const savings = claims.savings;
const coverage = claims.coverage;

/** Cubic-bezier as an SVG path in a 100×100 box (y up). */
const curve = ([x1, y1, x2, y2]: readonly number[]) =>
  `M0 100 C${x1 * 100} ${100 - y1 * 100} ${x2 * 100} ${100 - y2 * 100} 100 0`;

export function ComponentsSection() {
  return (
    <>
      <KitSection
        id="components"
        title="Components"
        intro={
          <>
            Shared by the site and the pitch: <code>Card</code>, <code>CardColumns</code>, <code>Pill</code>,{" "}
            <code>NumberBadge</code>, <code>Chip</code>, <code>Button mood=&quot;auto&quot;</code>,{" "}
            <code>SectionHeader</code>, <code>Stat</code>, <code>Footnote</code>. The same markup in each panel below; only
            the context changes.
          </>
        }
      >
        <ContextGrid>
          {() => (
            <div className="flex flex-col gap-8">
              <SectionHeader meta="02 · The problem" />

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="flex flex-col gap-3 p-6">
                  <span className="flex items-center gap-3">
                    <span aria-hidden className="ui-dot h-3 w-3" />
                    <h4 className="text-caps">Structural cost pressure</h4>
                  </span>
                  <p className="text-body-sm text-ui-ink-2">Outlined card: translucent fill, radius 24.</p>
                </Card>
                <Card variant="highlight" className="flex items-center gap-4 p-6">
                  <NumberBadge n={1} />
                  <h4 className="text-heading-md">Holobox installation</h4>
                </Card>
              </div>

              <Card>
                <CardColumns>
                  {["One-time setup", "Monthly service fee", "Variable component"].map((t) => (
                    <div key={t} className="p-6">
                      <h4 className="text-heading-sm">{t}</h4>
                    </div>
                  ))}
                </CardColumns>
              </Card>

              <div className="flex flex-wrap items-center gap-3">
                <Pill size="sm">Night-Only</Pill>
                <Pill>Day + Evening</Pill>
                <Pill size="lg">24/7 Premium</Pill>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <NumberBadge n={1} size="sm" isLit />
                <NumberBadge n={2} size="md" isLit />
                <NumberBadge n={3} size="md" />
                <NumberBadge n={4} size="lg" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Chip dot="live">Live in Amsterdam</Chip>
                {coverage.enabled && <Chip dot="accent">{coverage.en}</Chip>}
                <Chip>Real people, not AI</Chip>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button mood="auto" arrow>
                  Primary
                </Button>
                <Button mood="auto" variant="ghost">
                  Ghost
                </Button>
                <Button mood="auto" variant="glow">
                  Glow
                </Button>
              </div>

              {savings.enabled && savings.range && (
                <div className="flex flex-col gap-4">
                  <Stat
                    value={`${savings.range[0]}–${savings.range[1]}%`}
                    mark="*"
                    label="potential savings on front office costs"
                  />
                  <Footnote mark="*">
                    Estimate based on our operating model; actual savings depend on property size, service hours and
                    volume.
                  </Footnote>
                </div>
              )}
            </div>
          )}
        </ContextGrid>
      </KitSection>

      <KitSection
        id="motion"
        title="Motion"
        intro={
          <>
            Tokens in <code>kit.css</code> (<code>--ease-*</code>, <code>--dur-*</code>, <code>--stagger</code>) and{" "}
            <code>src/lib/motion-tokens.ts</code> for JS and WebGL. Animate transform, opacity, filter and clip-path only.
            Reduced motion: final states, crossfades instead of moves.
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <KitSub>Easings</KitSub>
            <div className="flex flex-wrap gap-6">
              {(Object.entries(EASING) as [string, readonly number[]][]).map(([name, b]) => (
                <figure key={name} className="flex flex-col gap-2">
                  <svg viewBox="-4 -4 108 108" className="h-28 w-28 rounded-md bg-night-800" aria-hidden>
                    <path d="M0 100 L100 0" stroke="currentColor" strokeOpacity={0.2} fill="none" />
                    <path d={curve(b)} stroke="currentColor" strokeWidth={2.5} fill="none" className="text-paper-50" />
                  </svg>
                  <figcaption className="font-mono text-[0.8125rem] text-paper-300">
                    --ease-{name === "inOut" ? "in-out" : name}
                    <br />
                    {b.join(", ")}
                  </figcaption>
                </figure>
              ))}
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-2 font-mono text-[0.8125rem] text-paper-300 sm:grid-cols-3">
              {Object.entries(DURATION).map(([k, v]) => (
                <li key={k}>
                  --{k === "stagger" ? "stagger" : `dur-${k}`} · {v}ms
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <KitSub>Durations</KitSub>
            <MotionDemo />
          </div>
        </div>
      </KitSection>
    </>
  );
}
