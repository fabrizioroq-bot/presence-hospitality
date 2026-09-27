// Single source for contact and legal data. Items marked PENDING/CONFIRM are tracked in PENDING.md.
export const site = {
  name: "Presence Hospitality",
  legalName: "Presence Hospitality B.V.",
  parent: "[partner]",
  // Canonical base: NEXT_PUBLIC_SITE_URL (set to the custom domain in production); previews fall
  // back to the deployment URL.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://presence-hospitality.com"),
  // The public domain (root is primary; www redirects to it), linked in the footer on every environment.
  domainUrl: "https://presence-hospitality.com",
  displayUrl: "www.presence-hospitality.com",
  // Labels come from messages (`common.phoneSales`, `common.phoneSupport`).
  phones: [
    { key: "sales", display: "[removed]", href: "tel:[removed]" },
    { key: "support", display: "[removed]", href: "tel:[removed]" },
  ],
  email: "info@presence-hospitality.com",
  address: {
    // CONFIRM: street spelling and postcode.
    street: "Korte Leidsedwarsstraat 92-1",
    city: "Amsterdam",
    country: "NL",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=Korte+Leidsedwarsstraat+92-1+Amsterdam",
  },
  kvk: null as string | null, // PENDING
  vat: null as string | null, // PENDING
} as const;
