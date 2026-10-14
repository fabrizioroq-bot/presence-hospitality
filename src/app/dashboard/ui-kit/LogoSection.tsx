import { Logo, LogoMark, LOGO_RULES } from "@/components/brand/Logo";
import { LOCKUP } from "@/components/brand/logo-paths";
import { ContextGrid, KitSection, KitSub } from "./ContextGrid";

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
        <KitSub>Logo and mark in every context</KitSub>
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
