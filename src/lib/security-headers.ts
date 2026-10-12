/**
 * Security headers. next.config.ts applies them to every route.
 * No server-only imports: next.config.ts loads this file at build time.
 */

export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  // The legacy XSS auditor is gone from modern browsers and could itself be abused; CSP replaces it.
  { key: "X-XSS-Protection", value: "0" },
];
