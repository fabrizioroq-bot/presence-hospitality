import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

export const hanken = Hanken_Grotesk({
  subsets: ["latin"], // Latin-1 covers Dutch diacritics (é, ë, ï)
  weight: ["400", "600", "800"],
  style: ["normal"],
  display: "swap",
  variable: "--font-hanken",
  adjustFontFallback: true,
});

// Italic is only used for the single emphasised phrase in headlines (800 italic).
export const hankenItalic = Hanken_Grotesk({
  subsets: ["latin"], // Latin-1 covers Dutch diacritics (é, ë, ï)
  weight: ["800"],
  style: ["italic"],
  display: "swap",
  variable: "--font-hanken-italic",
  // Preloaded: the emphasised phrase is in the hero H1. No generated Arial fallback: until the
  // italic arrives, `.emph` falls through to upright Hanken 800 (see globals.css), whose metrics
  // match, so the swap never re-wraps a headline (an Arial fallback caused a 0.17 layout shift).
  preload: true,
  adjustFontFallback: false,
  fallback: [],
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-jetbrains",
  // Not preloaded on purpose: three parallel font preloads on slow connections pushed the main
  // Hanken file past first paint (headline re-wrap, CLS 0.17). Labels are short single lines with
  // a metric-matched fallback, so their swap doesn't move anything.
  preload: false,
  adjustFontFallback: true,
});
