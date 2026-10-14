"use client";

import { useState } from "react";
import { packageHours, type HoursWindow } from "@/content/claims";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Labels";
import { cx } from "@/lib/cx";
import { usePitch } from "./pitch-store";

export type PackageId = "night" | "day" | "premium" | "addons";
export type PackageStrings = {
  items: Record<PackageId, { name: string; points: string[] }>;
  bands: { night: string; dayEvening: string; allDay: string; addons: string };
  startHere: string;
  illustrative: string;
  ringLabel: string;
};

const ORDER: PackageId[] = ["night", "day", "premium", "addons"];
/** Shape only, until the real windows are confirmed (claims.ts packageHours): no hours are labelled. */
const ILLUSTRATIVE: { night: HoursWindow; dayEvening: HoursWindow } = { night: [22, 7], dayEvening: [7, 22] };
const CX = 300;
const R = 220;

const point = (hour: number) => {
  const a = (hour / 24) * Math.PI * 2 - Math.PI / 2;
  return [CX + R * Math.cos(a), CX + R * Math.sin(a)] as const;
};
function arc([from, to]: HoursWindow) {
  const span = (to - from + 24) % 24 || 24;
  const [x1, y1] = point(from);
  const [x2, y2] = point(to);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 ${span > 12 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

/**
 * Packages: the builds walk Night-Only → Day + Evening → 24/7 Premium (+ add-ons); hover, focus or a
 * click selects any package at once. The 24 h ring lights the hours a package covers (opacity only).
 */
export function PackageRing({ strings, chapter }: { strings: PackageStrings; chapter: number }) {
  const pos = usePitch();
  const [picked, setPicked] = useState<{ id: PackageId; seq: number } | null>(null);
  const stepPackage: PackageId = ORDER[Math.min(pos.chapter === chapter ? pos.step : 2, 2)];
  // A pick holds until the presenter moves (any move bumps the store's seq).
  const active = picked && picked.seq === pos.seq ? picked.id : stepPackage;

  const isConfirmed = packageHours.status === "OK" && packageHours.nightOnly && packageHours.dayEvening;
  const night = packageHours.nightOnly ?? ILLUSTRATIVE.night;
  const dayEvening = packageHours.dayEvening ?? ILLUSTRATIVE.dayEvening;
  const band = active === "night" ? "night" : active === "day" ? "dayEvening" : active === "premium" ? "allDay" : null;
  const pick = (id: PackageId) => setPicked({ id, seq: pos.seq });

  return (
    <div className="grid h-full grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-[calc(var(--slide-u)*4)]">
      <div className="flex flex-col gap-[calc(var(--slide-u)*2)]">
        <div role="group" aria-label={strings.ringLabel} className="flex flex-wrap items-end gap-3">
          {ORDER.map((id) => (
            <div key={id} className="flex flex-col items-start gap-2">
              {id === "night" && <span className="text-slide-small font-semibold text-ui-ink-2">{strings.startHere}</span>}
              <button
                type="button"
                aria-pressed={active === id}
                onClick={() => pick(id)}
                onMouseEnter={() => pick(id)}
                onFocus={() => pick(id)}
                className={cx(
                  "min-h-11 rounded-pill px-5 py-2 text-slide-body font-black transition-[background-color,color,box-shadow] duration-(--dur-fast)",
                  active === id ? "ui-pill" : "text-ui-ink ring-[1.5px] ring-ui-line/60 hover:bg-ui-hover",
                )}
              >
                {strings.items[id].name}
              </button>
            </div>
          ))}
        </div>
        <Card className="p-[calc(var(--slide-u)*2)]">
          <h3 className="text-slide-h3">{strings.items[active].name}</h3>
          <ul key={active} className="pitch-swap mt-3 flex list-disc flex-col gap-1.5 pl-5 text-slide-body text-ui-ink-2">
            {strings.items[active].points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Card>
        {/* Third build: the add-ons that go on top of any package. */}
        <div data-build="2" className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-slide-small font-semibold">
            {strings.items.addons.name} · {strings.bands.addons}
          </span>
          {strings.items.addons.points.map((p) => (
            <Chip key={p} className="text-slide-small">
              {p}
            </Chip>
          ))}
        </div>
      </div>

      <figure className="relative mx-auto aspect-square h-[calc(var(--slide-u)*30)]">
        <svg viewBox="0 0 600 600" role="img" aria-label={`${strings.ringLabel}: ${band ? strings.bands[band] : strings.bands.addons}`} className="h-full w-full">
          <defs>
            <linearGradient id="pitch-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--pitch-pill-from)" />
              <stop offset="1" stopColor="var(--pitch-pill-to)" />
            </linearGradient>
          </defs>
          <circle cx={CX} cy={CX} r={R} fill="none" stroke="var(--ui-rule)" strokeOpacity={0.3} strokeWidth={44} />
          {[
            ["night", arc(night)],
            ["dayEvening", arc(dayEvening)],
          ].map(([id, d]) => (
            <path key={id} d={d} fill="none" stroke="url(#pitch-ring)" strokeWidth={44} className={cx("pitch-ring-band", band === id && "is-on")} />
          ))}
          <circle cx={CX} cy={CX} r={R} fill="none" stroke="url(#pitch-ring)" strokeWidth={44} className={cx("pitch-ring-band", band === "allDay" && "is-on")} />
          {/* midnight (moon) at the top, noon (sun) at the bottom; no hours until confirmed */}
          <path d="M300 40 a22 22 0 1 0 22 30 a16 16 0 1 1 -22 -30Z" fill="var(--ui-ink)" />
          <g transform="translate(300 556)" stroke="var(--ui-ink)" strokeWidth={4} strokeLinecap="round">
            <circle r="13" fill="var(--ui-ink)" stroke="none" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line key={a} x1="0" y1="-19" x2="0" y2="-26" transform={`rotate(${a})`} />
            ))}
          </g>
        </svg>
        <figcaption className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
          <span key={active} className="pitch-swap text-slide-h3">
            {band ? strings.bands[band] : strings.bands.addons}
          </span>
          {!isConfirmed && <Chip className="text-slide-small">{strings.illustrative}</Chip>}
        </figcaption>
      </figure>
    </div>
  );
}
