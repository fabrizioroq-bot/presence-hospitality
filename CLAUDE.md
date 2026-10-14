@AGENTS.md

# Presence Hospitality — website

Full spec: `PROMPT_SITIO.md`. Open items: `PENDING.md`. Both are **local only** (git-ignored, never pushed: the GitHub repo is public); keep internal notes, contacts and client details there, not in tracked files.

## Rules
- **Always follow the `presence-design` skill** (`.claude/skills/presence-design/`) for any UI work. Only token colours; no hex values in components.
- **Never invent figures, clients, testimonials, prices or response times.** Every figure lives in `src/content/claims.ts` and renders only when `enabled`.
- **No hard-coded copy in components.** Strings go in `messages/en.json` + `messages/nl.json` (keys must match — `npm run check:i18n`) or typed files in `src/content/`.
- No third-party logos, no stock photos. Partner names as plain text only.
- Next.js 16: `src/proxy.ts` (not middleware), async `params`, read `node_modules/next/dist/docs/` before using unfamiliar APIs.
- No JS animation library: reveals are CSS (`Reveal.tsx`, `data-rv`), scroll/springs via `src/lib/anim.ts`, hooks in `src/lib/hooks.ts`. Animate only transform/opacity/filter/clip-path. Respect reduced motion. Initial JS ≤ 180 KB per page (`node scripts/js-size.mjs`).
- Client components use `cx` (`@/lib/cx`, no tailwind-merge); server components may use `cn`.

## Git workflow
- Remote: `origin` = github.com/fabrizioroq-bot/presence-hospitality, **public**. Never commit internal notes, contacts, client details, secrets or lead data (`PENDING.md`, `PROMPT_SITIO.md`, `docs/`, `screenshots/`, `reports/`, `.env*` stay local). Check the staged diff before every push.
- `main` = production. No direct commits, no force-push (the one exception was replacing the old prototype, 14-10).
- One branch per task from an up-to-date `main`: `feat/<task>`, `fix/<task>` or `chore/<task>`.
- One commit per phase, Conventional Commits (`feat(scope): summary` + a short body), only after `npm run check` and `npm run build` pass. Author: the repo-level GitHub noreply address.
- Release: preview → approval → `git switch main && git pull` → `git merge --ff-only <branch>` (if it refuses, rebase the branch on `main` first) → `git push` → production deploy → verify live → delete the merged branch.
- Deploy: Vercel CLI for now (`vercel deploy` = preview, `vercel deploy --prod` = production).

## Stack
Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind CSS v4 (`src/styles/globals.css`) · React Three Fiber · next-intl (`/en`, `/nl`) · Supabase · Resend. Package manager: npm.

## Commands
- `npm run dev` — dev server
- `npm run build && npm start` — production
- `npm run check` — typecheck + lint + contrast + i18n
- `/dashboard/ui-kit` — admin-only UI kit: logo, tokens, shared components (site + pitch)
- `npm run brand` — regenerate logo files, favicons and OG images from the canonical logo paths

## Folder map
- `src/app/[locale]/` pages · `src/app/actions/` server actions
- `src/components/sections/` one file per page section · `hologram/` R3F scene · `brand/` logo, orbs, grain · `ui/` primitives
- `src/content/` site data, claims, packages, FAQ, onboarding
- `src/i18n/` routing · `messages/` translations · `scripts/` checks and generators
