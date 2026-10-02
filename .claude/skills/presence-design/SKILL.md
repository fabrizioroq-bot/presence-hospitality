---
name: presence-design
description: Presence Hospitality design system — tokens, typography, layout, motion and anti-generic rules. Use for every UI change on the Presence Hospitality website.
---

# Presence Hospitality — design system


### 4.0 "Warm Holographic Navy" (brand/UX research, 02-10) — supersedes the colours in 4.1–4.2 and the sizes in 4.3
"Make the technology feel extraordinary and the company feel ordinary to trust." Two visual systems:
- **Interface reality (the company):** warm ivory `--ph-bg-page #F6F2EC` backgrounds, white cards `#FFFFFF` with a subtle border (`--ph-border-subtle`) and a soft petrol shadow, petrol navy `#173B4D` for headlines, links and structure (tiles, bars, filled controls: `bg-petrol`), text `#172126` / secondary `#344249` / meta `#56636A`. CTAs are **solid terracotta** `#B74B32` (hover `#963821`), white text, no gradient, no scan sweep (`.btn-cta`).
- **Holographic reality (the product):** blue `#63B8D8`, cyan `#8BDCE5`, lavender/violet `#AFA5CE`, particles and dark cinematic scenes — **only** around the hologram, the Holobox, the guest-journey story and other tech moments. Lavender, cyan and blue are never backgrounds or UI colours on the interface.
- **Dark sections and footer:** `#0F1D25` (cards `#17272F`, deepest `#0A151B`). Hologram glow may live here. Checks, links and markers on dark interface sections use teal-light `--ph-accent-on-dark #9CC2B8`, not cyan.
- **Light sections:** ivory (default, `data-tone="ivory"`) or white (`data-tone="lavender"`, name kept for the hooks) with ivory cards. Orbs on light sections are warm sand / pale teal; on dark they switch to the holographic colours.
- **Emphasis:** `em.emph` is deep teal `#4A6A62` on light (no gradient on text); on dark it keeps a subtle holo-blue → cyan gradient. Key figures: petrol on light.
- **Charts and diagrams:** petrol, teal and terracotta; amber only for "paid idle time".
- Target share: ~45% ivory, 24% white, 15% dark petrol, 7% petrol, 4% holographic effects, 3% teal, 2% terracotta.
- **Readability (50+ visitors):** body 17px mobile / 18px desktop, line-height 1.6, ~68ch max; small text ≥ 15px; eyebrows (`text-label`) 13px mono with 0.08em tracking, only for very short labels; navigation 16px semibold; buttons 16px semibold, tap targets ≥ 44px; no 300 weights. Body and explanatory text aim for 7:1, AA is the floor (`npm run check:contrast`).
- Tokens: the `--ph-*` block in `tokens.css` / `globals.css`; older token names alias them.

### 4.0b Visual Trust (02-10) — how the two worlds are used
- "Make the technology feel extraordinary. Make the company feel ordinary to trust." ~70% hospitality world (ivory/white, petrol, natural editorial photos via `EditorialPhoto`, calm large type), ~30% Presence world (hologram, particles, dark scenes).
- Rhythm Human → Tech → Human; alternate WOW and QUIET sections (quiet = one message, one image, generous space, no orbs/dust).
- No receptionist faces or names anywhere; people imagery must be non-identifiable (hands, over the shoulder, workstations).
- Packages and Onboarding are calm pages: static, light, no pinned scroll. The most sophisticated effect is reserved for "a person appears" (the Holobox finale).
- Sections without real content stay hidden behind `src/content/flags.ts`; never fill them with estimates.

### 4.1 Visual concept: "Mist & Night", warm palette (client-approved 01-10) — superseded by 4.0
Two moods alternate down the page, like a hotel lobby between day and night:
- **Mist** (light): lavender light `--mist-bg #EEEAF3` canvas; light sections alternate with **warm ivory** `#F7F3EE` and **lavender mist** `#CFC7D9` (the brand colour) via `data-tone="ivory" | "lavender"` on the section *and* its `MoodTransition`/`CtaBand` (`tone` prop). Plum-black ink. Cards on ivory with soft plum-tinted shadows. Soft orbs of periwinkle, lavender, violet and blush, fine film grain. This is **hospitality: calm, human, warm.**
- **Night** (dark): **deep plum** `#2B2233` (cards `#221A29`, deepest `#1A1420`) with a subtle violet/blue glow. The footer is plum too. This is where the **technology** lives: the Holobox, the hologram and the 3D stay **holographic blue**.
- **Blush** `#E9CFC4` for tiny touches only (dust sparks, intro sparks). **Amber** stays only for the live dot, the traveller's suitcase and "paid idle time".

**Accent gradient (blue → violet):** conversion CTAs (`#2F4FD8 → #7B61C9`, white text, scan sweep, violet glow), the italic headline emphasis, key figures, step numbers/nodes, timeline fills, active dots and the active navbar link (`.btn-cta`, `em.emph`, `.key-figure`, `.step-num(-dark)`, `.step-node[data-lit]`, `.accent-dot/-bar/-line`, `.nav-ind`). Token names are historical: `--blue-700` (blue), `--cyan-700` (CTA violet), `--teal-700` (emphasis violet on light), `--cyan-300` (light violet on dark). On mist, gradient text runs `--blue-700 → --teal-700`; on night `--holo-400 → --cyan-300`. Keep it to ~10% of any viewport. `--holo-gradient` (highlight tiles, glow buttons, package tabs) is lavender-violet → ivory.

Colour roles: **ink = content, holo blue = technology (hologram, 3D, tech details), blue → violet = emphasis and the conversion CTA, lavender/ivory/plum = surfaces, amber/blush = tiny human warmth.** Use each colour with intent; never amber or blush for CTAs or text.

> The token list in §4.2 below is the original grey/blue set kept for history; **the live values are in `tokens.css` and `globals.css`** (both carry the warm palette) and `scripts/check-contrast.ts` verifies every pair.

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
  /* Accent blues (CTA / emphasis gradients) */
  --blue-700:       #1747A6; /* 5.98:1 on mist-bg; white on it 8.44:1 */
  --teal-700:       #0B6485; /* 4.69:1 on mist-bg */
  --cyan-700:       #0A7BA3; /* white on it 4.80:1 */
  --cyan-300:       #6FE3FF; /* 8.74:1 on charcoal */

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
  --focus:          #1747A6; /* blue-700 on mist; on night use --cyan-300 */
}
```

Buttons:
- **Primary (conversion CTA, mist and night):** `.btn-cta`: `linear-gradient(100deg, --blue-700, --cyan-700)`, white text (8.44:1 → 4.80:1), faint cyan rim, a slow light band ("hologram scan") crossing it every 6 s (off for reduced motion). Hover: brightness 1.08 + blue/cyan glow; arrow slides 4px right.
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

### 4.7 Motion tokens (no animation library since the final audit, 27-09)
Motion was removed to keep initial JS under 180 KB. Same values, implemented as:
- **Reveals** (`src/components/ui/Reveal.tsx`, CSS in `globals.css`, started by `RevealObserver`): server-rendered `data-rv-trigger` + `data-rv="fade|soft|word|line|bar|draw|…"`. `fade` = opacity 0 → 1, y 24 → 0, blur 6 → 0 over 0.7 s `cubic-bezier(0.16, 1, 0.3, 1)`; stagger via `--rv-step` (default 0.07 s), `--rv-delay`, `--rv-i`. Default trigger amount 0.3 (`data-rv-amount`); `data-rv-load` for above the fold. No JS or reduced motion → final state.
- **Scroll-linked + springs** (`src/lib/anim.ts`): `trackScroll(el, ["start end", "end start"], cb)` (Motion's offset syntax, measured on layout boxes so transforms never feed back), `spring()`, `interp()`, `Value`. Write styles straight to the DOM; never re-render React per frame.
- **Hooks** (`src/lib/hooks.ts`): `useReducedMotion`, `useInView`, `useNear` (unmount WebGL far off-screen).
- Hover: 150–250ms. No hover effect scales anything above `1.02`.
- Animate **only** `transform`, `opacity`, `filter` (blur ≤ 8px), and `clip-path`. Never animate layout properties.
- `prefers-reduced-motion: reduce`: every reveal renders in its final state, scrollytelling becomes a static vertical list, orbs stop drifting, the hologram renders one static frame (§6.7). Implement with `useReducedMotion()` from `@/lib/hooks` plus a CSS `@media` guard.

### 4.8 Anti "generic AI aesthetic" rules
1. **No neon-purple glows and no "aurora" behind the headline.** The only violet is the client-approved blue → violet accent gradient (CTA, emphasis) and soft lavender surfaces/orbs; never a large saturated purple fill.
2. **No row of three identical icon cards.** Every grid has hierarchy: one dominant element plus supporting ones, different spans, or a different medium (chart, list, panel).
3. **No generic line icons as decoration** (no lightning bolts, rockets or shields). Numbers in pill badges (pitch style) or custom SVG diagrams do that job.
4. **No glassmorphism cards over busy backgrounds.** Mist panels are outlined, not frosted.
5. **No centred-everything layouts.** Default alignment is left; centre only the final CTA.
6. **One primary CTA style per viewport.** "Book a demo" is always the same blue → cyan gradient pill (`.btn-cta`), on mist and on night.
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
- `AmbientDust` (2D canvas): 30–64 motes rising at 4–14 px/s with a gentle sway; ~60% lavender/violet + holo blue, ~8% blush sparks; only animates while on screen; half density and 30 fps on touch. Use `mood="night"` on dark sections.
- `ParallaxOrbs`: MistOrbs that shift ±70 px across the section's scroll range.
- `LightSweep`: a 38 s diagonal band of light, night sections only.
- Every section gets `ParallaxOrbs`, and night sections also get `AmbientDust` + `LightSweep`. Mist sections may use `AmbientDust` at `density ≤ 0.6`.

**Reduced motion:** the hero renders one static frame; dust, sweep and parallax are off; orbs are static.

**Performance rules:** client components receive strings as props (no client i18n runtime); no JS animation library (CSS reveals + `lib/anim.ts`); Lenis loads on the first mouse/wheel input; above-the-fold reveals must not animate opacity (use `RevealItem soft`). Initial JS budget: 180 KB per page (`node scripts/js-size.mjs`).

### 4.10 Scroll & scroll-driven storytelling (added in phase 5)
- **Lenis** smooth scroll site-wide (`SmoothScroll` in the layout, `lerp 0.1`, loaded on the first mouse/wheel input). Off for reduced motion; touch keeps native momentum. In-page `#links` go through `scrollToHash` (Lenis already honours `scroll-padding-top`, so don't add an offset). It moves focus to the target and updates the URL. Pause Lenis (`getLenis()?.stop()`) whenever the body is scroll-locked.
- **Pinned stories:** the track height is steps × 100svh (+40svh) and the stage is `sticky top-0 h-svh`. Drive everything from one scroll value `s` through a pure `timeline(s)` shared by WebGL, SVG and DOM. Step copy crossfades sequentially (never overlapping). The progress rail fills with scroll.
- **Desktop-only scenes load through a gate** (`StoryGate`): phones never download them. The server still renders the same content as a mobile/reduced list, and a same-height placeholder prevents layout shift.
- **Particle continuity:** scenes assemble from dust (`uForm`) and leave as rising dust (`uDissolve`). The hero agent dissolves as you scroll away; the next WebGL scene rebuilds from the same dust. Warm dots = human guest; cool holo = agent/technology.
- **CursorGlow:** one soft 520px radial light following the mouse (`soft-light` blend), fine pointers only.
- **Depth:** `Depth range={±30..40}` on large blocks (statements, panels, charts). Positive = further away. Never on body text inside cards.
- **Mood transitions:** always a `MoodTransition` band between mist and night (160px, 240px on desktop).

### 4.11 Immersion polish (client ideas 1–4, 27-09)
1. **Greeting:** the hero hologram nods, tilts its head and a light pulse rises through it once per visit after it forms, and again when the mouse enters the portal (desktop, ≥ 8 s apart). The stage agent greets when it first forms. Shader uniforms `uNod`, `uTilt`, `uGreet`.
2. **Day → night:** `--dusk` (0 → 1 over the page, `DayNight.tsx`) mixes the mist canvas towards `#D2D8E8` and the night canvas towards `#24272E` (AA-checked; `@supports color-mix` only).
3. **Contextual cursor** (`CursorRing.tsx`, fine pointer + motion allowed; native cursor kept): ring grows on links, label pill "Drag" (`data-cursor="drag"`), "Book" (`.btn-cta`), "Play" (`data-cursor="play"`); hidden over form fields.
4. **Magnetic buttons** (`.magnetic`, ≤ 6 px pull via CursorRing) + press feedback (`scale: 0.97`, all devices).
