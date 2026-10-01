/**
 * Hero photograph (client choice 01-10: guest with a suitcase in a hotel corridor). To use your own
 * photo: put it in /public/images/hero/ (ideal 4:5 portrait, at least 1600×2000 px, JPEG/WebP ≤ 1 MB,
 * the person in the middle third) and edit the entry below (`src`, `width`, `height`, focal points;
 * alt text in messages → hero.photoAlt). next/image makes the AVIF/WebP sizes. Credits: CREDITS.md.
 */
export type HeroPhoto = {
  src: string;
  width: number;
  height: number;
  /** object-position on phones (card ≈ square) and desktop (card is portrait): keep the person in frame. */
  focus: { mobile: string; desktop: string };
  credit: { photographer: string; source: string; license: "Pexels License" | "Unsplash License" };
};

export const HERO_PHOTO: HeroPhoto = {
  src: "/images/hero/hero-guest-suitcase-corridor.jpg",
  width: 1600,
  height: 2400,
  focus: { mobile: "55% 45%", desktop: "55% 50%" },
  credit: { photographer: "Anna Shvets", source: "https://www.pexels.com/photo/woman-with-a-suitcase-walking-on-a-corridor-12663076/", license: "Pexels License" },
};
