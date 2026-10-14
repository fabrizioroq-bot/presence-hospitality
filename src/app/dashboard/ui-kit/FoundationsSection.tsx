import { ContextGrid, KitSection, KitSub } from "./ContextGrid";
import { TokenValue } from "./TokenValue";

type Token = `--${string}`;

const SITE_PALETTE: [Token, string][] = [
  ["--ph-bg-page", "Ivory page"],
  ["--ph-bg-surface", "White card"],
  ["--ph-bg-dark", "Dark section"],
  ["--ph-brand-primary", "Petrol: headlines, structure, logo ink"],
  ["--ph-brand-secondary", "Muted teal: charts"],
  ["--ph-text-primary", "Text"],
  ["--ph-text-secondary", "Secondary text"],
  ["--ph-text-muted", "Meta text"],
  ["--ph-cta-bg", "Terracotta CTA"],
  ["--ph-border-ui", "Control border"],
  ["--ph-hologram-blue", "Hologram blue (tech only)"],
  ["--ph-hologram-cyan", "Hologram cyan (tech only)"],
  ["--ph-hologram-violet", "Hologram violet (tech only)"],
  ["--amber-400", "Amber: paid idle time only"],
];
const PITCH_PALETTE: [Token, string][] = [
  ["--pitch-mist", "Light chapters"],
  ["--pitch-charcoal", "Dark chapters · ink on light"],
  ["--pitch-ink-muted", "Meta text on mist"],
  ["--pitch-paper-2", "Secondary text on charcoal"],
  ["--pitch-paper-muted", "Meta text on charcoal"],
  ["--pitch-pill-from", "Pill gradient start"],
  ["--pitch-pill-to", "Pill gradient end"],
  ["--pitch-orb-blue", "Orb (blurred only)"],
  ["--pitch-orb-aqua", "Orb (blurred only)"],
  ["--pitch-orb-peach", "Orb (blurred only)"],
  ["--pitch-orb-pink", "Orb (blurred only)"],
];
const ROLES: [Token, string][] = [
  ["--ui-bg", "Background"],
  ["--ui-ink", "Text"],
  ["--ui-ink-2", "Secondary text"],
  ["--ui-muted", "Meta / footnotes"],
  ["--ui-heading", "Headings"],
  ["--ui-logo", "Logo ink"],
  ["--ui-line", "Control boundary"],
  ["--ui-rule", "Hairlines, dividers"],
  ["--ui-card-bg", "Card fill"],
  ["--ui-card-line", "Card outline"],
  ["--ui-highlight", "Highlight fill / pill"],
  ["--ui-num-bg", "Number circle"],
  ["--ui-btn-bg", "Primary button"],
  ["--ui-dot", "Accent dot"],
];

function Swatch({ token, label }: { token: Token; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="h-11 w-11 shrink-0 rounded-md ring-1 ring-ui-rule/40" style={{ background: `var(${token})` }} />
      <span className="flex min-w-0 flex-col">
        <span className="text-body-sm font-semibold">{label}</span>
        <span className="font-mono text-[0.8125rem] text-ui-muted">
          {token} · <TokenValue name={token} className="" />
        </span>
      </span>
    </div>
  );
}

const SCALE = [
  ["text-display-2xl", "Stop hiring front desk staff."],
  ["text-display-xl", "Margins are under pressure"],
  ["text-display-lg", "Behind the scenes"],
  ["text-heading-md", "Holobox installation"],
  ["text-caps", "Structural cost pressure"],
  ["text-heading-sm", "Night-Only"],
  ["text-body-lg", "Real receptionists, live as a life-size hologram in your lobby."],
  ["text-body", "Guests check in on their own; when they need someone, a receptionist appears."],
  ["text-body-sm", "Illustrative shape, not measured data."],
  ["text-label", "Live in Amsterdam · 24/7"],
] as const;

const RADII = [
  ["--r-sm", "8px · inputs, tags"],
  ["--r-md", "14px · small cards"],
  ["--r-lg", "24px · cards (site and pitch)"],
  ["--r-xl", "48px · big panels, Holobox portal"],
  ["--r-pill", "pill · buttons, pills, chips"],
] as const;

const SPACING = [4, 8, 16, 24, 32, 48, 64, 96, 128, 160] as const;

export function FoundationsSection() {
  return (
    <>
      <KitSection
        id="colour"
        title="Colour"
        intro={
          <>
            Two palettes, one set of roles. The website palette (&quot;Warm Holographic Navy&quot;) is global; the pitch
            palette is scoped to <code>data-theme=&quot;pitch&quot;</code> / <code>&quot;pitch-dark&quot;</code>. Components
            read <code>--ui-*</code> roles only. Values below are read live from the CSS.
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div data-mood="mist" className="flex flex-col gap-4 rounded-lg bg-ui-bg p-6 text-ui-ink sm:p-8">
            <p className="text-label text-ui-muted">Website palette</p>
            {SITE_PALETTE.map(([t, l]) => (
              <Swatch key={t} token={t} label={l} />
            ))}
          </div>
          <div data-theme="pitch" className="flex flex-col gap-4 rounded-lg p-6 sm:p-8">
            <p className="text-label text-ui-muted">Pitch palette (scoped)</p>
            {PITCH_PALETTE.map(([t, l]) => (
              <Swatch key={t} token={t} label={l} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <KitSub>Roles per context</KitSub>
          <ContextGrid>
            {() => (
              <div className="grid gap-4 sm:grid-cols-2">
                {ROLES.map(([t, l]) => (
                  <Swatch key={t} token={t} label={l} />
                ))}
              </div>
            )}
          </ContextGrid>
        </div>
      </KitSection>

      <KitSection
        id="type"
        title="Typography"
        intro={
          <>
            Hanken Grotesk only (one variable file, weights 400 / 600 / 800 / 900 + italic 800 / 900), JetBrains Mono for
            labels. Same scale everywhere; the display weight is a role: 800 on the site, 900 in the pitch. One italic
            emphasis per headline. Body never below 400 and 15px (readability for 50+).
          </>
        }
      >
        <ContextGrid only={["site-light", "pitch-light"]} columns={1}>
          {() => (
            <div className="flex flex-col gap-6">
              {SCALE.map(([cls, sample]) => (
                <div key={cls} className="grid gap-2 border-t border-ui-rule/30 pt-4 lg:grid-cols-[14rem_1fr] lg:items-baseline">
                  <span className="font-mono text-[0.8125rem] text-ui-muted">{cls}</span>
                  {cls === "text-display-2xl" ? (
                    <p className={cls}>
                      Stop hiring <em className="emph">front desk</em> staff.
                    </p>
                  ) : (
                    <p className={cls}>{sample}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ContextGrid>
        <ContextGrid only={["site-dark", "pitch-dark"]}>
          {() => (
            <div className="flex flex-col gap-4">
              <p className="text-display-lg">
                Let&apos;s make your front desk <em className="emph">work smarter.</em>
              </p>
              <p className="text-body-lg text-ui-ink-2">See it live in Amsterdam, or start with a Night-Only pilot.</p>
              <p className="text-label text-ui-muted">Thank you for your time and attention</p>
            </div>
          )}
        </ContextGrid>
        <div data-theme="pitch" className="flex flex-wrap items-baseline gap-x-10 gap-y-4 rounded-lg p-6 sm:p-8">
          {[
            ["400", "font-normal"],
            ["600", "font-semibold"],
            ["800", "font-extrabold"],
            ["900", "font-black"],
            ["800 italic", "font-extrabold italic font-(family-name:--font-hanken-italic)"],
            ["900 italic", "font-black italic font-(family-name:--font-hanken-italic)"],
          ].map(([label, cls]) => (
            <span key={label} className="flex flex-col gap-1">
              <span className={`text-[2.25rem] leading-none tracking-[-0.03em] ${cls}`}>Aa</span>
              <span className="font-mono text-[0.8125rem] text-ui-muted">{label}</span>
            </span>
          ))}
        </div>
      </KitSection>

      <KitSection
        id="shape"
        title="Shape, borders & spacing"
        intro="Radii and spacing are shared. Borders are the one difference: 1px card lines on the site, 1.5px white outlines in the pitch. 8px grid; 4px only for icon gaps."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div data-mood="mist" className="flex flex-col gap-4 rounded-lg bg-ui-bg p-6 text-ui-ink sm:p-8">
            <p className="text-label text-ui-muted">Radii</p>
            <div className="flex flex-wrap gap-4">
              {RADII.map(([t, l]) => (
                <div key={t} className="flex w-36 flex-col gap-2">
                  <span aria-hidden className="ui-card h-20" style={{ borderRadius: `var(${t})` }} />
                  <span className="font-mono text-[0.8125rem]">{t}</span>
                  <span className="text-body-sm text-ui-ink-2">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div data-mood="mist" className="flex flex-col gap-4 rounded-lg bg-ui-bg p-6 text-ui-ink sm:p-8">
            <p className="text-label text-ui-muted">Spacing (px)</p>
            <div className="flex flex-col gap-2">
              {SPACING.map((px) => (
                <div key={px} className="flex items-center gap-4">
                  <span className="w-10 text-right font-mono text-[0.8125rem] text-ui-muted">{px}</span>
                  <span aria-hidden className="h-3 rounded-sm bg-petrol" style={{ width: px }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <ContextGrid>
          {(ctx) => (
            <div className="flex flex-col gap-4">
              <p className="text-body-sm text-ui-ink-2">
                Card outline <TokenValue name="--ui-card-line-w" className="font-mono" /> · focus ring 2px
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="ui-card h-20 w-40" />
                <button type="button" className="min-h-11 rounded-pill px-5 text-body-sm font-semibold ring-1 ring-ui-line outline-2 outline-offset-3 outline-(--ui-focus)">
                  Focus ring · {ctx.label}
                </button>
              </div>
            </div>
          )}
        </ContextGrid>
      </KitSection>
    </>
  );
}
