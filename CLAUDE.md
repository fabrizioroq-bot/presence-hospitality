@AGENTS.md

# Presence Hospitality — website

Full spec: `PROMPT_SITIO.md`. Open items: `PENDING.md`.

## Rules
- **Always follow the `presence-design` skill** (`.claude/skills/presence-design/`) for any UI work. Only token colours; no hex values in components.
- **Never invent figures, clients, testimonials, prices or response times.** Every figure lives in `src/content/claims.ts` and renders only when `enabled`.
- **No hard-coded copy in components.** Strings go in `messages/en.json` + `messages/nl.json` (keys must match — `npm run check:i18n`) or typed files in `src/content/`.
- No third-party logos, no stock photos. Partner names as plain text only.
- Next.js 16: `src/proxy.ts` (not middleware), async `params`, read `node_modules/next/dist/docs/` before using unfamiliar APIs.
- No JS animation library: reveals are CSS (`Reveal.tsx`, `data-rv`), scroll/springs via `src/lib/anim.ts`, hooks in `src/lib/hooks.ts`. Animate only transform/opacity/filter/clip-path. Respect reduced motion. Initial JS ≤ 180 KB per page (`node scripts/js-size.mjs`).
- Client components use `cx` (`@/lib/cx`, no tailwind-merge); server components may use `cn`.

## Stack
Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind CSS v4 (`src/styles/globals.css`) · React Three Fiber · next-intl (`/en`, `/nl`) · Supabase · Resend. Package manager: npm.

## Commands
- `npm run dev` — dev server
- `npm run build && npm start` — production
- `npm run check` — typecheck + lint + contrast + i18n
- `/en/styleguide` — dev-only design reference

## Folder map
- `src/app/[locale]/` pages · `src/app/actions/` server actions
- `src/components/sections/` one file per page section · `hologram/` R3F scene · `brand/` logo, orbs, grain · `ui/` primitives
- `src/content/` site data, claims, packages, FAQ, onboarding
- `src/i18n/` routing · `messages/` translations · `scripts/` checks and generators
