// Home case study (hidden behind flags.caseStudy until a real pilot can be published).
// TODO(content): every field must come from a real hotel that agreed to be named. Never fill with estimates.
export type CaseStudy = {
  hotel: string;
  city: string;
  rooms: number;
  coverage: { en: string; nl: string };
  quote: { en: string; nl: string };
  quoteBy: string;
  metrics: { label: { en: string; nl: string }; value: string }[];
  photo: { src: string; width: number; height: number };
};

export const caseStudy: CaseStudy | null = null;
