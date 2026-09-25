---
name: presence-design
description: Presence Hospitality design system — tokens, typography, layout, motion and anti-generic rules. Use for every UI change on the Presence Hospitality website.
---

# Presence Hospitality — design system


### 4.1 Visual concept: "Mist & Night"
Two moods alternate down the page, like a hotel lobby between day and night:
- **Mist** (light): the pitch deck's look. A cool grey-blue canvas, soft blurred orbs of sky blue, mint, lavender and a hint of peach, with fine film grain. Charcoal ink. Thin outlined panels with large radii. This is **hospitality: calm, human, daylight.**
- **Night** (dark): charcoal and near-black. This is where the **technology** lives: the Holobox portal, the hologram, glowing cyan-blue light, mono HUD labels.
- **Warmth** is carried by a single amber accent (like the lobby lamp and the "HOTEL" neon in the pitch): live dots, the hologram's rim sparks, tiny highlights. Never a large fill.

Colour roles are strict: **ink = content, holo blue = technology/system, amber = human warmth/live.** No component uses holo and amber at equal weight.

### 4.2 Colour tokens (AA-verified)
All ratios below were computed with the WCAG 2.x formula. `scripts/check-contrast.ts` must re-verify them in CI (`npm run check:contrast`) and fail below the stated minimum.

```css
:root {
  /* Mist (light surfaces) */
  --mist-bg:        #D3DAE1; /* page canvas (pitch background) */
  --mist-surface:   #E4E9EE; /* panels, inputs */
  --mist-raised:    #F2F5F8; /* popovers, focused input */
  --ink-900:        #1D1F23; /* headings/body on mist — 11.7:1 on bg */
  --ink-700:        #3E4046; /* secondary text — 7.35:1 */
  --ink-500:        #5A5E66; /* captions, min size 14px — 4.61:1 */
  --line-mist:      #636870; /* panel outlines & input borders — 3.98:1 (≥3:1 UI) */
  --link-mist:      #1C5AA0; /* inline links on mist — 4.93:1 */

  /* Night (dark surfaces) */
  --night-900:      #121417; /* Holobox interior, deepest */
  --night-800:      #1B1D21; /* dark cards */
  --charcoal-700:   #2F3136; /* dark section canvas (pitch dark slides) */
  --paper-50:       #F4F6F8; /* text on dark — 12.0:1 on charcoal, 17.0:1 on night */
  --paper-300:      #C5CAD1; /* secondary on dark — 7.9:1 */
  --paper-500:      #A3AAB4; /* captions on dark — 5.56:1 */
  --line-night:     #7C838E; /* outlines on dark — 3.41:1 on charcoal */

  /* Holo (technology) */
  --holo-100:       #E6F2FF; /* pitch highlight-card gradient end */
  --holo-300:       #BFE0FF; /* 9.5:1 on charcoal */
  --holo-400:       #8CC4FF; /* hologram core, 7.1:1 on charcoal */
  --holo-500:       #5AA8F5;
  --holo-600:       #2F7FD0; /* decorative only on mist */
  --holo-gradient:  linear-gradient(100deg, #9DC9FF 0%, #E6F2FF 100%); /* pitch step cards; ink-900 on it ≥ 9.6:1 */

  /* Warm accent */
  --amber-300:      #F8C98B;
  --amber-400:      #F5A94A; /* 6.6:1 on charcoal; ink-900 on amber 8.37:1; NEVER as text on mist */

  /* Orbs (decorative only, always blurred) */
  --orb-sky:        #8DB3DF;
  --orb-mint:       #BEE6DA;
  --orb-lavender:   #D6C6E4;
  --orb-peach:      #F1C7A3;

  /* Feedback */
  --danger-mist:    #A8321F; /* 4.74:1 */
  --danger-night:   #FF8A75; /* 5.67:1 */
  --success-mist:   #1E6B45; /* 4.59:1 */
  --success-night:  #7FD9A8; /* 7.68:1 */

  /* Focus ring */
  --focus:          #1C5AA0; /* on mist; on night use --holo-300 */
}
```

Buttons:
- **Primary on mist:** `--ink-900` bg, `--paper-50` text (15.2:1). Hover: bg lifts to `#2A2D33`, arrow icon slides 4px right.
- **Primary on night:** `--paper-50` bg, `--ink-900` text.
- **Glow (secondary):** `--holo-gradient` bg, `--ink-900` text, 1px `--ink-900` at 15% border. Used once per viewport at most.
- **Ghost:** transparent, 1px `--line-mist` / `--line-night` border.

### 4.3 Typography
Google Fonts via `next/font/google` (self-hosted, `display: "swap"`, subsets `["latin", "latin-ext"]` for Dutch diacritics):
- **Display + UI + body: `Hanken Grotesk`**, a neo-grotesk that matches the pitch's heavy tight headlines. Load weights **300, 400, 600, 800** and **italic 800 only**. Variable font if available.
- **Mono (HUD, labels, step numbers): `JetBrains Mono`** weights 400, 500. Loaded with `preload: false` (not needed for LCP).

Fluid scale (mobile 360px → desktop 1440px):

| Token | Size | Line-height | Tracking | Weight | Use |
|---|---|---|---|---|---|
| `display-2xl` | `clamp(3rem, 1.2rem + 7.6vw, 8rem)` | 0.92 | -0.045em | 800 | Hero H1 only |
| `display-xl` | `clamp(2.5rem, 1.2rem + 5vw, 5.75rem)` | 0.95 | -0.04em | 800 | Section titles |
| `display-lg` | `clamp(2rem, 1.3rem + 2.8vw, 3.75rem)` | 1.0 | -0.035em | 800 | Sub-titles, big numbers |
| `heading-md` | `clamp(1.375rem, 1.15rem + 0.9vw, 1.875rem)` | 1.15 | -0.02em | 800 | Card titles (pitch "Holobox installation") |
| `heading-sm` | `1.125rem` | 1.3 | -0.01em | 600 | List titles |
| `caps` | `clamp(1rem, 0.9rem + 0.4vw, 1.25rem)` | 1.1 | -0.01em | 800 uppercase | Pitch-style pillar titles ("STRUCTURAL COST PRESSURE") |
| `body-lg` | `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)` | 1.55 | 0 | 300 | Lead paragraphs (pitch light body) |
| `body` | `1rem` | 1.6 | 0 | 400 | Default |
| `body-sm` | `0.875rem` | 1.5 | 0 | 400 | Captions, footnotes |
| `label` | `0.75rem` | 1 | 0.14em | Mono 500 uppercase | Eyebrows, HUD |

Rules:
- Emphasis inside headlines = **italic 800** (the pitch's "*front desk*"). Max one italic phrase per headline.
- Measure: body max `64ch`, lead max `52ch`.
- Never below 14px except `label` (12px mono, uppercase, must still pass 4.5:1).
- Numbers in mono use `font-variant-numeric: tabular-nums`.

### 4.4 Spacing, grid, radii, elevation
- **8px grid.** Scale: `4 (icon gaps only), 8, 16, 24, 32, 48, 64, 96, 128, 160, 192`.
- Section vertical padding: mobile `96px`, tablet `128px`, desktop `160px`. Hero: `min-height: 100svh`.
- Container: max `1360px`; side gutters `16px` (<640), `32px` (640–1023), `48px` (≥1024). 4 columns on mobile, 8 on tablet, 12 on desktop, gap 24px.
- **Radii:** `--r-sm 8px` (inputs, tags), `--r-md 16px` (small cards), `--r-lg 32px` (panels), `--r-xl 48px` (pitch-style big outlined panels, Holobox portal), `--r-pill 999px` (buttons, step badges, package pills).
- **Outlined panels (pitch signature):** 1px `--line-mist` or `--line-night`, radius `--r-xl`, transparent or `--mist-surface` fill. Columns inside are separated by 1px vertical dividers inset 32px top/bottom.
- **Elevation on mist:** avoid heavy shadows. `--shadow-soft: 0 24px 60px -30px rgba(29,31,35,0.35)` for floating elements only.
- **Glow on night:** `--glow-holo: 0 0 0 1px rgba(140,196,255,0.35), 0 0 32px rgba(140,196,255,0.28), 0 0 96px rgba(140,196,255,0.14)`; `--glow-amber: 0 0 12px rgba(245,169,74,0.6)` (live dots only).

### 4.5 Atmosphere components (brand/)
- **`MistOrbs`:** 3–4 absolutely positioned circles (`--orb-*`), each 40–70vw, `filter: blur(80px)` (40px on mobile), opacity 0.55–0.8. They drift ±4% over 18–26s (CSS keyframes, `transform` only). Static with reduced motion. Positions are set per section so no two sections look identical.
- **`Grain`:** fixed full-screen overlay, inline SVG `feTurbulence` (baseFrequency 0.8, numOctaves 3) as a data-URI background, `opacity: 0.06` on mist, `0.08` on night, `mix-blend-mode: overlay`, `pointer-events: none`. Static, never animated.
- **Hex line motif:** the pitch shows faint hexagon outlines bottom-left. Reproduce as an SVG with 1px `--ink-900` strokes at 6% opacity, in Hero and Onboarding only.

### 4.6 Logo (provisional)
The client has no logo file. The pitch shows a mark of **interlocking rounded loops** (four petal-like loops woven around a centre) next to "Presence Hospitality" in heavy grotesk.
- Build `Logo.tsx`: an SVG approximation of that mark on a 24×24 viewBox. Four rounded rectangular loops (rx 5), each rotated 90° from the previous, overlapping at the centre with over/under weaving via stroke masking; stroke 2px, `currentColor`. On night backgrounds the stroke uses `--holo-gradient`.
- Wordmark: "Presence Hospitality" in Hanken Grotesk 800, tracking -0.04em, 1.25rem in the navbar.
- Mark it `TODO(brand): replace with official vector if/when supplied` and list it in `PENDING.md`.
- Favicon: `app/icon.svg` = the mark alone, `--ink-900` on transparent.

### 4.7 Motion tokens
```ts
// src/lib/motion.ts
export const ease = { out: [0.16, 1, 0.3, 1], inOut: [0.65, 0, 0.35, 1] } as const;
export const dur = { fast: 0.15, base: 0.25, slow: 0.4, reveal: 0.7, hero: 1.2 } as const;
export const spring = { type: "spring", stiffness: 260, damping: 30 } as const;
export const reveal = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.7, ease: ease.out } },
};
export const stagger = (s = 0.07) => ({ show: { transition: { staggerChildren: s } } });
```
- Scroll reveals: `whileInView="show"`, `viewport={{ once: true, amount: 0.3 }}`.
- Hover: 150–250ms. No hover effect scales anything above `1.02`.
- Animate **only** `transform`, `opacity`, `filter` (blur ≤ 8px), and `clip-path`. Never animate layout properties.
- `prefers-reduced-motion: reduce`: every reveal renders in its final state, scrollytelling becomes a static vertical list, orbs stop drifting, the hologram renders one static frame (§6.7). Implement with Motion's `useReducedMotion()` plus a CSS `@media` guard.

### 4.8 Anti "generic AI aesthetic" rules
1. **No purple/violet gradients, no neon-purple glows**, no "aurora" behind the headline. Our gradients are only `--holo-gradient` and the blurred orbs.
2. **No row of three identical icon cards.** Every grid has hierarchy: one dominant element plus supporting ones, different spans, or a different medium (chart, list, panel).
3. **No generic line icons as decoration** (no lightning bolts, rockets or shields). Numbers in pill badges (pitch style) or custom SVG diagrams do that job.
4. **No glassmorphism cards over busy backgrounds.** Mist panels are outlined, not frosted.
5. **No centred-everything layouts.** Default alignment is left; centre only the final CTA.
6. **One primary CTA style per viewport.** "Book a demo" is always the same black pill on mist and white pill on night.
7. **No emoji, no "✨", no fake dashboards with invented metrics, no fake logos strip.**
8. Headlines state a benefit or a fact; they never say "Welcome to the future of…".
9. Every section has a distinct layout silhouette. Check this by scrolling the full page at 25% zoom: no two consecutive sections may share the same structure.
10. Text over the 3D scene always sits on a solid or scrim area with verified contrast.

---


### 4.9 Ambient motion & depth (added in phase 3)
The page must never feel static, but motion stays calm: nothing faster than ~15 px/s, no loops shorter than 4 s (except the live dot), nothing that competes with reading.

**Hero: one WebGL canvas** (`src/components/hologram/hero-scene.ts`), behind the hero content:
- Pass 1 (full canvas): light fog (FBM noise tinted with the orb colours, ≤ 0.34 alpha, calmer behind the text column), a soft light that follows the mouse, far drifting particles in three depth layers (discarded inside the Holobox), and the **Holobox panel itself**, drawn as a rounded rect aligned to the DOM `[data-portal]` element.
- Pass 2 (portal viewport + rounded-rect clip): the hologram agent, light cone and emitter rings.
- Pass 3: a few large, very soft bokeh dots in front (depth).
- The DOM portal keeps its fill + SVG poster until the scene paints (`data-webgl="ready"` on the hero), then fades them out.
- **Loads on first interaction** (pointer, wheel, scroll, touch, key) or after 7 s. Never during initial load (keeps TBT ≈ 0 and LCP on the H1/lead).
- No post-processing: glow comes from additive soft sprites.

**Depth / parallax** (`HeroShell` + `Parallax`): text moves least (mouse ±6/4 px, scroll −70 px), the Holobox more (mouse ±14/10 px, scroll +60 px), and the background most (in shader). Springs: stiffness 40, damping 18. Mouse parallax only for fine pointers.

**Other sections (no WebGL):**
- `AmbientDust` (2D canvas): 30–64 motes rising at 4–14 px/s with a gentle sway; cool holo + ~8% amber; only animates while on screen; half density and 30 fps on touch. Use `mood="night"` on dark sections.
- `ParallaxOrbs`: MistOrbs that shift ±70 px across the section's scroll range.
- `LightSweep`: a 38 s diagonal band of light, night sections only.
- Every section gets `ParallaxOrbs`, and night sections also get `AmbientDust` + `LightSweep`. Mist sections may use `AmbientDust` at `density ≤ 0.6`.

**Reduced motion:** the hero renders one static frame; dust, sweep and parallax are off; orbs are static.

**Performance rules:** client components receive strings as props (no client i18n runtime); the navbar uses CSS transitions, not Motion; Motion is used for reveals and parallax only; above-the-fold reveals must not animate opacity (use `RevealItem soft`).

### 4.10 Scroll & scroll-driven storytelling (added in phase 5)
- **Lenis** smooth scroll site-wide (`SmoothScroll` in the layout, `lerp 0.1`). Off for reduced motion; touch keeps native momentum. In-page `#links` go through `scrollToHash` (Lenis already honours `scroll-padding-top`, so don't add an offset). It moves focus to the target and updates the URL. Pause Lenis (`getLenis()?.stop()`) whenever the body is scroll-locked.
- **Pinned stories:** the track height is steps × 100svh (+40svh) and the stage is `sticky top-0 h-svh`. Drive everything from one scroll value `s` through a pure `timeline(s)` shared by WebGL, SVG and DOM. Step copy crossfades sequentially (never overlapping). The progress rail fills with scroll.
- **Desktop-only scenes load through a gate** (`StoryGate`): phones never download them. The server still renders the same content as a mobile/reduced list, and a same-height placeholder prevents layout shift.
- **Particle continuity:** scenes assemble from dust (`uForm`) and leave as rising dust (`uDissolve`). The hero agent dissolves as you scroll away; the next WebGL scene rebuilds from the same dust. Warm dots = human guest; cool holo = agent/technology.
- **CursorGlow:** one soft 520px radial light following the mouse (`soft-light` blend), fine pointers only.
- **Depth:** `Depth range={±30..40}` on large blocks (statements, panels, charts). Positive = further away. Never on body text inside cards.
- **Mood transitions:** always a `MoodTransition` band between mist and night (160px, 240px on desktop).
