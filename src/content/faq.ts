// FAQ order and visibility. Text lives in messages/{en,nl}.json under faq.items.<id>.
// Disabled rows are hidden on the page and excluded from FAQPage JSON-LD.
export const faq = [
  { id: "pms", enabled: true },
  { id: "kiosk", enabled: true },
  { id: "night", enabled: true },
  { id: "agents", enabled: true },
  { id: "staff", enabled: true },
  { id: "channels", enabled: true },
  { id: "pricing", enabled: true },
  { id: "timeline", enabled: true },
  { id: "where", enabled: true },
  // PENDING: privacy/GDPR answer to be supplied by the client; no copy exists yet.
  { id: "privacy", enabled: false },
] as const;
