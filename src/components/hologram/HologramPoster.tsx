import { POSTER_COOL, POSTER_VIEWBOX, POSTER_WARM } from "./poster-points";
import { cn } from "@/lib/cn";

/**
 * Static SVG stand-in for the WebGL hologram: shown while loading, without WebGL2,
 * and as the first paint. Same silhouette as the point cloud (front view).
 */
export function HologramPoster({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={POSTER_VIEWBOX}
      preserveAspectRatio="xMidYMax meet"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <radialGradient id="poster-glow" cx="50%" cy="55%" r="50%">
          <stop offset="0" stopColor="#8CC4FF" stopOpacity="0.22" />
          <stop offset="1" stopColor="#8CC4FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="poster-beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#8CC4FF" stopOpacity="0.28" />
          <stop offset="1" stopColor="#8CC4FF" stopOpacity="0" />
        </linearGradient>
        <pattern id="poster-scan" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="1.2" fill="#121417" fillOpacity="0.45" />
        </pattern>
      </defs>
      <ellipse cx="150" cy="330" rx="150" ry="260" fill="url(#poster-glow)" />
      <path d="M92 592 L118 40 L182 40 L208 592 Z" fill="url(#poster-beam)" />
      <path d={POSTER_COOL} stroke="#8CC4FF" strokeWidth="2.1" strokeLinecap="round" />
      <path d={POSTER_WARM} stroke="#F5A94A" strokeWidth="2.4" strokeLinecap="round" />
      <rect width="300" height="600" fill="url(#poster-scan)" />
      <ellipse cx="150" cy="592" rx="70" ry="7" fill="none" stroke="#8CC4FF" strokeOpacity="0.5" />
      <ellipse cx="150" cy="592" rx="46" ry="4.5" fill="none" stroke="#8CC4FF" strokeOpacity="0.35" />
      <ellipse cx="150" cy="592" rx="72" ry="7.5" fill="none" stroke="#F5A94A" strokeOpacity="0.4" strokeWidth="0.6" />
    </svg>
  );
}
