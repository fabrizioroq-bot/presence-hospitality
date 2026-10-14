// Every figure that may appear on the site lives here. Components render a claim only when `enabled`.
export type Claim = {
  id: "savings" | "amsterdamTax" | "coverage";
  en: string;
  nl: string;
  source: string | null;
  /** Optional numeric range for animated display (e.g. 40–65). */
  range?: [number, number];
  enabled: boolean;
  status: "OK" | "CONFIRM";
};

export const claims: Record<Claim["id"], Claim> = {
  savings: {
    id: "savings",
    en: "Up to 40–65% savings on front office costs",
    nl: "Tot 40–65% besparing op front-office-kosten",
    source: "Presence Hospitality Pitch V1.0, slide 5",
    range: [40, 65],
    enabled: true,
    status: "CONFIRM",
  },
  amsterdamTax: {
    id: "amsterdamTax",
    en: "In Amsterdam, a proposed 20% city tax combined with 21% VAT could absorb up to ~41% of revenue in taxes.",
    nl: "In Amsterdam kan een voorgestelde toeristenbelasting van 20% samen met 21% btw tot ~41% van de omzet aan belastingen opslokken.",
    source: null, // PENDING: public source URL required before enabling
    enabled: false,
    status: "CONFIRM",
  },
  coverage: {
    id: "coverage",
    en: "24/7",
    nl: "24/7",
    source: "Business plan + pitch",
    enabled: true,
    status: "OK",
  },
};

/**
 * Service windows per package, for the pitch's 24-hour ring. CONFIRM: no fixed windows yet, so the
 * ring shows unlabelled "Night" and "Day + Evening" bands marked "Illustrative" until these are filled
 * in (hours 0–24, local time; a window may wrap past midnight, e.g. [23, 7]).
 */
export type HoursWindow = readonly [start: number, end: number];
export const packageHours: {
  nightOnly: HoursWindow | null;
  dayEvening: HoursWindow | null;
  source: string | null;
  status: "OK" | "CONFIRM";
} = {
  nightOnly: null,
  dayEvening: null,
  source: null,
  status: "CONFIRM",
};
