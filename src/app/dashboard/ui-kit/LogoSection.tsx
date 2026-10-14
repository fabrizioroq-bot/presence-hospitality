import { Logo, LogoMark, LOGO_RULES } from "@/components/brand/Logo";
import { LOCKUP, MARK_PATH } from "@/components/brand/logo-paths";
import { Chip } from "@/components/ui/Labels";
import { ContextGrid, KitSection, KitSub } from "./ContextGrid";

// Comparison only (decision pending, see PENDING.md): A is the provisional mark the site used until
// now, B the official deck vector, C the same vector rotated 45°. Delete A/C once a choice is made.
function ProvisionalMark({ className }: { className: string }) {
  return (
    <svg viewBox="-12 -12 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      {[45, 135, 225, 315].map((r) => (
        <rect key={r} x={-3.4} y={-10.4} width={6.8} height={12.4} rx={3.4} transform={`rotate(${r})`} />
      ))}
    </svg>
  );
}
function DeckMark({ className, rotate = 0 }: { className: string; rotate?: number }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} fill="currentColor" aria-hidden>
      <path fillRule="evenodd" transform={`rotate(${rotate})`} d={MARK_PATH} />
    </svg>
  );
}

const OPTIONS = [
  { id: "A", title: "Website until now", note: "Provisional recreation: four uniform-stroke pills on the diagonals.", Mark: ProvisionalMark },
  { id: "B", title: "Pitch deck — official vector", note: "Extracted from the Canva deck as is. Recommended.", Mark: DeckMark },
  {
    id: "C",
    title: "Official vector, rotated 45°",
    note: "Same vector, loops on the diagonals like A.",
    Mark: ({ className }: { className: string }) => <DeckMark className={className} rotate={45} />,
  },
] as const;

const DOWNLOADS = [
  ["presence-hospitality-logo-on-light", "Logo · for light backgrounds"],
  ["presence-hospitality-logo-on-dark", "Logo · for dark backgrounds"],
  ["presence-hospitality-mark-on-light", "Mark · for light backgrounds"],
  ["presence-hospitality-mark-on-dark", "Mark · for dark backgrounds"],
] as const;

// Clear space demo: a 48px-tall lockup; X = the mark's height inside it.
const DEMO_H = 48;
const markX = (DEMO_H * LOCKUP.mark.size) / LOCKUP.height;

export function LogoSection() {
  return (
    <KitSection
      id="logo"
      title="Logo"
      intro={
        <>
          One component (<code>Logo</code>, <code>LogoMark</code>) and one set of files, generated from the same paths
          (<code>npm run brand</code>). The wordmark is Hanken Grotesk 900, outlined, so it never depends on an
          installed font. Ink: petrol on light backgrounds, white on dark. Nothing else.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <KitSub>Mark — decision pending</KitSub>
          <span data-mood="night">
            <Chip dot="live">Waiting for your choice</Chip>
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {OPTIONS.map(({ id, title, note, Mark }) => (
            <div key={id} className="flex flex-col gap-4 rounded-lg border border-line-night/50 p-5">
              <p className="text-heading-sm text-paper-50">
                {id} · {title}
              </p>
              <p className="text-body-sm text-paper-300">{note}</p>
              <div className="grid grid-cols-2 gap-2">
                {(["mist", "night"] as const).map((mood) =>
                  (["site", "pitch"] as const).map((sys) => (
                    <div
                      key={mood + sys}
                      {...(sys === "site" ? { "data-mood": mood } : { "data-theme": mood === "mist" ? "pitch" : "pitch-dark" })}
                      className="flex items-end gap-4 rounded-md bg-ui-bg p-4 text-ui-logo"
                    >
                      <Mark className="h-14 w-14" />
                      <Mark className="h-6 w-6" />
                      <Mark className="h-4 w-4" />
                    </div>
                  )),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <KitSub>Canonical logo (option B) in every context</KitSub>
        <ContextGrid>
          {() => (
            <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
              <Logo className="h-9" />
              <LogoMark className="h-12 w-12" />
              <LogoMark className="h-6 w-6" />
            </div>
          )}
        </ContextGrid>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <KitSub>Clear space</KitSub>
          <div data-mood="mist" className="flex justify-center rounded-lg bg-ui-bg p-8">
            <div
              className="relative outline-1 outline-ui-rule outline-dashed"
              style={{ padding: markX * LOGO_RULES.clearSpace }}
            >
              <Logo className="h-12" />
              <span className="absolute top-1 left-1 text-label text-ui-muted">½X</span>
            </div>
          </div>
          <p className="text-body-sm text-paper-300">
            X = the mark&apos;s height. Keep ½X free on every side: no text, edges or busy imagery inside it.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <KitSub>Minimum size</KitSub>
          <div data-mood="mist" className="flex flex-wrap items-end gap-10 rounded-lg bg-ui-bg p-8">
            <div className="flex flex-col gap-3">
              {/* 13px tall ≈ 120px wide at the lockup's aspect ratio. */}
              <Logo className="h-[13px]" decorative />
              <span className="text-label text-ui-muted">
                Lockup ≥ {LOGO_RULES.minLockupWidthPx}px / {LOGO_RULES.minLockupWidthMm} mm wide
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <LogoMark className="h-4 w-4" />
              <span className="text-label text-ui-muted">
                Mark ≥ {LOGO_RULES.minMarkPx}px / {LOGO_RULES.minMarkMm} mm
              </span>
            </div>
          </div>
          <p className="text-body-sm text-paper-300">
            Below the lockup minimum, use the mark alone. Never place the logo below the mark minimum.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <KitSub>Files (Canva, PDFs, partners)</KitSub>
          <ul className="flex flex-col divide-y divide-line-night/40 rounded-lg border border-line-night/50">
            {DOWNLOADS.map(([file, label]) => (
              <li key={file} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <span className="text-body-sm text-paper-50">{label}</span>
                <span className="flex gap-4 text-body-sm font-semibold">
                  <a className="underline underline-offset-4" href={`/brand/${file}.svg`} download>
                    SVG
                  </a>
                  <a className="underline underline-offset-4" href={`/brand/${file}.png`} download>
                    PNG
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <KitSub>Don&apos;t</KitSub>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-body-sm text-paper-300">
            <li>Recolour it (only petrol on light, white on dark), add gradients, glows or outlines.</li>
            <li>Rotate, skew, stretch or re-space the mark and wordmark.</li>
            <li>Retype the wordmark in another font or weight: use the files.</li>
            <li>Place it on busy photos without a solid or scrim area behind it.</li>
          </ul>
        </div>
      </div>
    </KitSection>
  );
}
