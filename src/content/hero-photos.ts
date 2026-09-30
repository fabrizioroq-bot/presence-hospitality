/**
 * Hero photographs. To use your own photo: put it in /public/images/hero/ (ideal 4:5 portrait,
 * at least 1600×2000 px, JPEG/WebP ≤ 1 MB, the person in the middle third) and edit the entry below
 * (`src`, `width`, `height`, focal points, alt text in messages → hero.photoAlt*). next/image makes
 * the AVIF/WebP sizes. Credits for stock photos: CREDITS.md.
 *
 * Preview: `?hero=1..4` shows another variant (boot script → html[data-hero]); `HERO_PHOTO_DEFAULT`
 * is the one everyone sees.
 */
export type HeroPhoto = {
  src: string;
  width: number;
  height: number;
  /** object-position on phones (card ≈ square) and desktop (card is portrait): keep the person in frame. */
  focus: { mobile: string; desktop: string };
  altKey: "photoAlt1" | "photoAlt2" | "photoAlt3" | "photoAlt4";
  credit: { photographer: string; source: string; license: "Pexels License" | "Unsplash License" };
};

export const HERO_PHOTOS: HeroPhoto[] = [
  {
    src: "/images/hero/hero-1-self-checkin-tablet.jpg",
    width: 2400,
    height: 1600,
    focus: { mobile: "60% 50%", desktop: "58% 50%" },
    altKey: "photoAlt1",
    credit: { photographer: "Bluestonex", source: "https://unsplash.com/photos/Li6MH3rfyPo", license: "Unsplash License" },
  },
  {
    src: "/images/hero/hero-2-guest-suitcase-corridor.jpg",
    width: 1600,
    height: 2400,
    focus: { mobile: "55% 45%", desktop: "55% 50%" },
    altKey: "photoAlt2",
    credit: { photographer: "Anna Shvets", source: "https://www.pexels.com/photo/woman-with-a-suitcase-walking-on-a-corridor-12663076/", license: "Pexels License" },
  },
  {
    src: "/images/hero/hero-3-guest-arriving-boutique.jpg",
    width: 2400,
    height: 1600,
    focus: { mobile: "58% 50%", desktop: "58% 50%" },
    altKey: "photoAlt3",
    credit: { photographer: "Andrea Piacquadio", source: "https://www.pexels.com/photo/woman-pulling-her-luggage-3923502/", license: "Pexels License" },
  },
  {
    src: "/images/hero/hero-4-guest-mobile-checkin.jpg",
    width: 2400,
    height: 1600,
    focus: { mobile: "45% 50%", desktop: "40% 50%" },
    altKey: "photoAlt4",
    credit: { photographer: "August de Richelieu", source: "https://www.pexels.com/photo/a-man-using-a-smartphone-7433146/", license: "Pexels License" },
  },
];

/** 1-based index of the photo shown by default. */
export const HERO_PHOTO_DEFAULT = 1;
