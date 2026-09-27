import { cx as cn } from "@/lib/cx";
import { DOOR, FLOOR, HOLOBOX, HUB, KIOSK, PERSON_SCALE, timeline } from "./layout";

// World → SVG units (viewBox 1600 × 1000).
const X = (x: number) => (x + 8) * 100;
const Y = (y: number) => (5 - y) * 100;

export type SketchLabels = { entrance: string; kiosk: string; holobox: string; hub: string };

/**
 * Line drawing of the lobby at scroll position `s` (0..6). Used for the mobile / reduced-motion
 * step list and as the poster/fallback behind the WebGL story.
 */
export function LobbySketch({ s, labels, className }: { s: number; labels?: SketchLabels; className?: string }) {
  const t = timeline(s);
  const personH = 1.75 * PERSON_SCALE * 100; // SVG units
  const gx = X(t.guestX);
  const floorY = Y(FLOOR);
  const guestOpacity = t.guestIn * (1 - t.guestOut);
  const scr = KIOSK.screen;
  const sx0 = X(scr.x0);
  const sx1 = X(scr.x1);
  const sy0 = Y(scr.y1);
  const sy1 = Y(scr.y0);
  const posterScale = personH / 580;
  const guestScale = (100 * PERSON_SCALE) / 300; // guest poster: 300 units per world unit
  const bob = t.walking * Math.abs(Math.sin(t.guestX * 3.4)) * 6;

  return (
    <svg viewBox="0 0 1600 1000" className={cn("h-auto w-full", className)} aria-hidden fill="none">
      <defs>
        <linearGradient id="lobby-floor" x1="0" x2="1">
          <stop offset="0" stopColor="#C5CAD1" stopOpacity="0" />
          <stop offset="0.15" stopColor="#C5CAD1" stopOpacity="0.5" />
          <stop offset="0.85" stopColor="#C5CAD1" stopOpacity="0.5" />
          <stop offset="1" stopColor="#C5CAD1" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lobby-box" cx="50%" cy="100%" r="80%">
          <stop offset="0" stopColor="#2F7FD0" stopOpacity={0.35 * (0.3 + t.agent * 0.7)} />
          <stop offset="1" stopColor="#2F7FD0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Floor */}
      <line x1="0" x2="1600" y1={floorY} y2={floorY} stroke="url(#lobby-floor)" strokeWidth="2" />

      {/* Entrance */}
      <rect x={X(DOOR.x0)} y={Y(DOOR.y1)} width={X(DOOR.x1) - X(DOOR.x0)} height={floorY - Y(DOOR.y1)} stroke="#C5CAD1" strokeOpacity="0.6" strokeWidth="2" />
      <circle cx={X(DOOR.x0) + 24} cy={(Y(DOOR.y1) + floorY) / 2 + 20} r="6" stroke="#C5CAD1" strokeOpacity="0.6" strokeWidth="2" />

      {/* Kiosk */}
      <rect x={sx0} y={sy0} width={sx1 - sx0} height={sy1 - sy0} rx="16" stroke="#F4F6F8" strokeOpacity="0.75" strokeWidth="2" fill="#1B1D21" />
      <rect x={X(KIOSK.pole.x0)} y={sy1} width={X(KIOSK.pole.x1) - X(KIOSK.pole.x0)} height={floorY - sy1} stroke="#C5CAD1" strokeOpacity="0.6" strokeWidth="2" />
      <line x1={X(KIOSK.base.x0)} x2={X(KIOSK.base.x1)} y1={floorY - 6} y2={floorY - 6} stroke="#C5CAD1" strokeOpacity="0.6" strokeWidth="4" strokeLinecap="round" />
      {/* Screen states */}
      <g opacity={1 - Math.max(t.alert, t.done)}>
        {[0, 1].map((row) => (
          <g key={row}>
            <line x1={sx0 + 30} x2={sx1 - 30} y1={sy0 + 70 + row * 50} y2={sy0 + 70 + row * 50} stroke="#7C838E" strokeWidth="2" />
            {Array.from({ length: 6 }, (_, i) => (
              <circle key={i} cx={sx0 + 40 + i * 18} cy={sy0 + 58 + row * 50} r="4" fill="#BFE0FF" opacity={t.typing * 12 - (row * 6 + i) > 0 ? 1 : 0} />
            ))}
          </g>
        ))}
        <rect x={sx0 + 30} y={sy1 - 45} width={sx1 - sx0 - 60} height="24" rx="12" fill="#F4F6F8" fillOpacity="0.85" />
      </g>
      <g opacity={t.alert}>
        <circle cx={(sx0 + sx1) / 2} cy={(sy0 + sy1) / 2} r="34" fill="#F5A94A" />
        <text x={(sx0 + sx1) / 2} y={(sy0 + sy1) / 2 + 14} textAnchor="middle" fontSize="44" fontWeight="800" fill="#1D1F23">
          !
        </text>
      </g>
      <g opacity={t.done}>
        <circle cx={(sx0 + sx1) / 2} cy={(sy0 + sy1) / 2} r="34" fill="#7FD9A8" />
        <path d={`M${(sx0 + sx1) / 2 - 15} ${(sy0 + sy1) / 2} l10 10 l20 -22`} stroke="#1D1F23" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Holobox */}
      <rect x={X(HOLOBOX.x0)} y={Y(HOLOBOX.y1)} width={X(HOLOBOX.x1) - X(HOLOBOX.x0)} height={floorY - Y(HOLOBOX.y1)} rx="40" fill="url(#lobby-box)" stroke="#8CC4FF" strokeOpacity="0.7" strokeWidth="2" />
      <line x1={X(HOLOBOX.x0) + 20} x2={X(HOLOBOX.x1) - 20} y1={Y(HOLOBOX.plinth)} y2={Y(HOLOBOX.plinth)} stroke="#8CC4FF" strokeOpacity="0.5" strokeWidth="2" />
      <line x1={X(HOLOBOX.x0) + 20} x2={X(HOLOBOX.x1) - 20} y1={Y(HOLOBOX.cap)} y2={Y(HOLOBOX.cap)} stroke="#8CC4FF" strokeOpacity="0.35" strokeWidth="2" />
      <g opacity={t.agent} transform={`translate(${X(HOLOBOX.cx) - 150 * posterScale} ${Y(HOLOBOX.plinth) - 600 * posterScale}) scale(${posterScale})`}>
        {/* Point paths are server-rendered once in <SketchDefs> (keeps ~9 KB gz of path data out of the JS). */}
        <use href="#ls-cool" stroke="#8CC4FF" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
        <use href="#ls-warm" stroke="#F5A94A" strokeWidth="8" strokeLinecap="round" />
      </g>

      {/* Call to the hub */}
      <path
        d={`M${X(HUB.from[0])} ${Y(HUB.from[1])} Q${X(HUB.ctrl[0])} ${Y(HUB.ctrl[1])} ${X(HUB.to[0])} ${Y(HUB.to[1])}`}
        stroke="#8CC4FF"
        strokeWidth="3"
        strokeDasharray="4 14"
        strokeLinecap="round"
        opacity={t.flow}
      />

      {/* Guest: the dotted traveller with a rolling suitcase (same points as the 3D scene). */}
      <g
        opacity={guestOpacity}
        transform={`translate(${gx - 120 * guestScale} ${floorY - 590 * guestScale - bob}) scale(${guestScale})`}
        strokeLinecap="round"
      >
        <use href="#ls-guest-body" stroke="#F4F6F8" strokeWidth="7" />
        <use href="#ls-guest-case" stroke="#F8C98B" strokeWidth="7" />
      </g>

      {labels && (
        <g fontFamily="var(--font-mono), monospace" fontSize="36" letterSpacing="3" fill="#A3AAB4">
          <text x={(X(DOOR.x0) + X(DOOR.x1)) / 2} y={floorY + 50} textAnchor="middle">{labels.entrance.toUpperCase()}</text>
          <text x={(sx0 + sx1) / 2} y={floorY + 50} textAnchor="middle">{labels.kiosk.toUpperCase()}</text>
          <text x={X(HOLOBOX.cx)} y={floorY + 50} textAnchor="middle">{labels.holobox.toUpperCase()}</text>
          <text x="1530" y="80" textAnchor="end" opacity={Math.max(t.flow, 0.4)}>{labels.hub.toUpperCase()}</text>
        </g>
      )}
    </svg>
  );
}
