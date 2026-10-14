// Single source for contact and legal data. Items marked PENDING/CONFIRM are tracked in PENDING.md.
export const site = {
  name: "Presence Hospitality",
  // Home-screen label (iOS "Add to Home Screen", web manifest short_name).
  shortName: "Presence",
  legalName: "Presence Hospitality B.V.",
  // The public domain (root is primary; www and the vercel.app alias redirect to it). Every canonical,
  // hreflang, Open Graph URL, sitemap entry and structured-data URL uses it, on every environment
  // (previews are noindex), so search engines never see a vercel.app URL as the original.
  domainUrl: "https://presence-hospitality.com",
  displayUrl: "www.presence-hospitality.com",
  email: "info@presence-hospitality.com",
  address: {
    // CONFIRM: street spelling. Postcode confirmed by the client (02-10).
    street: "Korte Leidsedwarsstraat 92-1",
    postalCode: "1017 NM",
    city: "Amsterdam",
    country: "NL",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=Korte+Leidsedwarsstraat+92-1+1017+NM+Amsterdam",
  },
  // Brand image for search results and structured data (square, on white; scripts/generate-brand-assets.mjs).
  logo: "/brand/presence-hospitality-logo-512.png",
  // Official profiles for structured data (`sameAs`). PENDING: LinkedIn etc. from the client.
  sameAs: [] as string[],
  // Search engine ownership checks (public meta tags, not secrets). Google also has public/google*.html. PENDING: Bing code.
  // google: the `content` of <meta name="google-site-verification">; bing: <meta name="msvalidate.01">.
  verification: { google: "sS0MFYGWb45GFhYKepsqJ6BYWXm2AJrlCgtPm0Iw1TI", bing: "" },
  // IndexNow (Bing, Yandex, Seznam…): public key, served as /<key>.txt from public/. Not a secret.
  indexNowKey: "cbfd2825b1349918dcbce86b1f549c79",
  kvk: null as string | null, // PENDING
  vat: null as string | null, // PENDING
} as const;
