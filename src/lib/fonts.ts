import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

export const hanken = Hanken_Grotesk({
  subsets: ["latin"], // Latin-1 covers Dutch diacritics (é, ë, ï)
  weight: ["300", "400", "600", "800"],
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
  preload: false,
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-jetbrains",
  preload: false,
});
