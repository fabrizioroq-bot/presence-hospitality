import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/** Web app manifest: brand name, colours and icons (icons from scripts/generate-brand-assets.mjs). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Presence",
    description: "Presence Hospitality: remote front office and holographic reception for hotels.",
    start_url: "/en",
    scope: "/",
    display: "browser",
    background_color: "#F6F2EC",
    theme_color: "#F6F2EC",
    icons: [
      { src: "/icon1.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
