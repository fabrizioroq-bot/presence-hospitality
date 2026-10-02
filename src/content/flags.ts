// Sections that are built but hidden until real content exists (see PENDING.md "Visual Trust").
// Turn a flag on only when the content it needs is in place.
export const flags = {
  /** Home 06: a 30–45 s unedited Holobox call. Needs the video + captions in src/content/media.ts. */
  realCallVideo: false,
  /** Home 08: one named pilot hotel with permission, metrics and an owner quote (src/content/case-study.ts). */
  caseStudy: false,
} as const;
