// FAQ order and visibility ("Questions hotel owners ask us"). Text lives in messages/{en,nl}.json under
// faq.items.<id>. Disabled rows are hidden on the page and excluded from FAQPage JSON-LD.
// The difficult questions come first: answering them directly is itself a trust signal.
export const faq = [
  { id: "night", enabled: true },
  { id: "kiosk", enabled: true },
  { id: "internet", enabled: true },
  { id: "device", enabled: true },
  { id: "emergency", enabled: true },
  { id: "remote", enabled: true },
  { id: "nights", enabled: true },
  // PENDING: needs real guest feedback or pilot data; no answer may be written before that.
  { id: "acceptance", enabled: false },
  { id: "agents", enabled: true },
  { id: "staff", enabled: true },
  { id: "pms", enabled: true },
  { id: "channels", enabled: true },
  { id: "pricing", enabled: true },
  { id: "timeline", enabled: true },
  { id: "where", enabled: true },
  // PENDING: privacy/GDPR answer to be supplied by the client; no copy exists yet.
  { id: "privacy", enabled: false },
] as const;
