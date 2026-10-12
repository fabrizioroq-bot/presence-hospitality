/**
 * Security headers. next.config.ts applies them to every route; the proxy adds the nonce CSP
 * on /dashboard. No server-only imports: next.config.ts loads this file at build time.
 */

import { site } from "../content/site";

const isDev = process.env.NODE_ENV === "development";
// Vercel's preview toolbar loads from vercel.live; production deployments never show it.
const isPreview = process.env.VERCEL_ENV === "preview";

export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  // The legacy XSS auditor is gone from modern browsers and could itself be abused; CSP replaces it.
  { key: "X-XSS-Protection", value: "0" },
  // Replaces the "*" Vercel's CDN adds to static responses. www redirects to the domain, so the
  // domain is the only origin that serves pages; nothing is meant to be read cross-origin.
  { key: "Access-Control-Allow-Origin", value: site.domainUrl },
];

/** Enforced. To trial a change without breaking pages, use "Content-Security-Policy-Report-Only". */
export const CSP_HEADER = "Content-Security-Policy";

/**
 * Everything the browser loads is same-origin: Supabase and Resend are only called server-side,
 * fonts are self-hosted by next/font, the hologram .bin files and the video live in /public.
 *
 * With a nonce (the dynamic /dashboard) scripts need the per-request nonce. Without one (the
 * statically generated public pages) inline scripts are allowed: Next.js streams the page data as
 * inline scripts that differ per page and build, so they can't be hashed, and a nonce would force
 * every page to render per request. The pages render no user-supplied HTML.
 */
export function contentSecurityPolicy(nonce?: string) {
  const live = isPreview ? " https://vercel.live" : "";
  const script = nonce ? `'nonce-${nonce}' 'strict-dynamic'` : `'unsafe-inline'${live}`;
  return [
    "default-src 'self'",
    `script-src 'self' ${script}${isDev ? " 'unsafe-eval'" : ""}`,
    // React style attributes and next/font: inline styles only, no inline scripts.
    `style-src 'self' 'unsafe-inline'${live}`,
    `img-src 'self' data: blob:${isPreview ? " https://vercel.live https://vercel.com" : ""}`,
    `font-src 'self'${isPreview ? " https://vercel.live https://assets.vercel.com" : ""}`,
    `connect-src 'self'${isPreview ? " https://vercel.live wss://ws-us3.pusher.com" : ""}`,
    `frame-src ${isPreview ? "https://vercel.live" : "'none'"}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}
