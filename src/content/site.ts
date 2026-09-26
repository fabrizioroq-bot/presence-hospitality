// Single source for contact and legal data. Items marked PENDING/CONFIRM are tracked in PENDING.md.
export const site = {
  name: "Presence Hospitality",
  legalName: "Presence Hospitality B.V.",
  parent: "[partner]",
  // Custom domain once DNS is live; on Vercel previews fall back to the deployment URL.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.presencehospitality.com"),
  displayUrl: "www.presencehospitality.com",
  phone: {
    display: "[removed]",
    href: "tel:[removed]",
  },
  // CONFIRM: spelling as supplied by the client (pitch domain is presencehospitality.com).
  email: "[removed]",
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
