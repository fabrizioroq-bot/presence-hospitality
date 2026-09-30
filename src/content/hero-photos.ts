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
    src: "/images/hero/hero-1-receptionist-smile.jpg",
    width: 2400,
    height: 1680,
    focus: { mobile: "50% 40%", desktop: "52% 40%" },
    altKey: "photoAlt1",
    credit: { photographer: "Andrea Piacquadio", source: "https://www.pexels.com/photo/hospitable-woman-standing-behind-front-desk-3771087/", license: "Pexels License" },
  },
  {
    src: "/images/hero/hero-2-receptionist-lamp.jpg",
    width: 2400,
    height: 1600,
    focus: { mobile: "48% 35%", desktop: "47% 35%" },
    altKey: "photoAlt2",
    credit: { photographer: "Andrea Piacquadio", source: "https://www.pexels.com/photo/wooden-front-desk-for-reception-3771811/", license: "Pexels License" },
  },
  {
    src: "/images/hero/hero-3-guests-welcome.jpg",
    width: 2400,
    height: 1600,
    focus: { mobile: "45% 40%", desktop: "44% 40%" },
    altKey: "photoAlt3",
    credit: { photographer: "cottonbro studio", source: "https://www.pexels.com/photo/people-at-front-desk-5378703/", license: "Pexels License" },
  },
  {
    src: "/images/hero/hero-4-inn-reception.jpg",
    width: 2400,
    height: 1600,
    focus: { mobile: "8% 50%", desktop: "0% 50%" },
    altKey: "photoAlt4",
    credit: { photographer: "Zoshua Colah", source: "https://unsplash.com/photos/wOkEwfChQqM", license: "Unsplash License" },
  },
];

/** 1-based index of the photo shown by default. */
export const HERO_PHOTO_DEFAULT = 1;
