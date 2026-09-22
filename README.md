# Presence Hospitality

A single-page, illustrative "Front Office as a Service" pitch site for boutique
hotels. Scroll drives a first-person camera walkthrough (Vite + React Three
Fiber) from a hotel entrance to a check-in totem, where a contact form is
integrated into the kiosk's screen. `prefers-reduced-motion`, viewports under
768px, and browsers without WebGL all get a static 2D fallback with the same
copy.

## Stack

Vite + React + TypeScript, `@react-three/fiber` / `@react-three/drei` /
`@react-three/postprocessing`, Lenis (smooth scroll), Zustand (scroll
progress store), Tailwind CSS, react-router-dom, Supabase (auth + leads
storage), a Vercel Function with Nodemailer (Gmail SMTP) for the contact form.

## Local setup

```bash
npm install
npm run dev
```

The 3D experience needs no environment variables. `/login` and `/dashboard`
need a Supabase project (see below) — without it they'll fail gracefully with
a login error, not crash the site.

## Supabase setup

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor — creates
   the `leads` table with RLS (authenticated read-only; inserts happen only
   via the service role key from the Vercel Function).
3. Authentication → Users → **Add user** — create the account(s) that should
   have dashboard access. There is no public sign-up.

## Environment variables

Copy `.env.example` to `.env.local` for local dev, and set the same keys in
Vercel → Settings → Environment Variables for deploys:

| Variable | Where it's used | Notes |
|---|---|---|
| `GMAIL_USER` | `api/contact.ts` | Gmail address that sends the notification email |
| `GMAIL_APP_PASSWORD` | `api/contact.ts` | Google Account → Security → App Passwords (needs 2FA enabled) |
| `SUPABASE_URL` | `api/contact.ts` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `api/contact.ts` | Service role key — server-side only, never `VITE_`-prefixed |
| `VITE_SUPABASE_URL` | frontend | Supabase project URL (public) |
| `VITE_SUPABASE_ANON_KEY` | frontend | Supabase anon key (public; security comes from RLS, not secrecy) |

## Deploy

Push to a repo Vercel is connected to (framework preset: Vite; `/api` is
auto-detected as serverless functions). `vercel.json` adds the SPA rewrite
needed for `/login` and `/dashboard` to work on direct load/refresh. Set the
environment variables above after the first deploy, then redeploy.

## Scripts

- `npm run dev` — dev server
- `npm run build` — type-check + production build
- `npm run lint` — oxlint
- `npm run preview` — preview the production build locally
