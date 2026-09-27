import { useId, type CSSProperties } from "react";
import { DEMAND_SHAPE, smoothPath } from "@/lib/chart";

export type DemandChartLabels = {
  title: string;
  staffed: string;
  demand: string;
  idle: string;
  caption: string;
  desc: string;
};

type Variant = {
  w: number;
  h: number;
  tickEvery: number;
  font: number;
  stroke: number;
  inline: boolean;
};
const DESKTOP: Variant = {
  w: 1200,
  h: 320,
  tickEvery: 3,
  font: 12,
  stroke: 1,
  inline: true,
};
const MOBILE: Variant = {
  w: 640,
  h: 270,
  tickEvery: 6,
  font: 22,
  stroke: 1.8,
  inline: false,
};

const STAFFED = 0.86;
const NIGHT: [number, number][] = [
  [0, 7],
  [22, 24],
];

function Chart({
  v,
  labels,
  className,
}: {
  v: Variant;
  labels: DemandChartLabels;
  className: string;
}) {
  const id = useId().replace(/:/g, "");
  const pad = { l: 8, r: 8, t: v.font * 3, b: v.font * 3.2 };
  const iw = v.w - pad.l - pad.r;
  const ih = v.h - pad.t - pad.b;
  const x = (hour: number) => pad.l + (hour / 24) * iw;
  const y = (val: number) => pad.t + (1 - val) * ih;
  const base = y(0);
  const ys = y(STAFFED);

  const demand = smoothPath(DEMAND_SHAPE.map((val, i) => [x(i), y(val)]));
  const area = `${demand} L${x(24)} ${base} L${x(0)} ${base} Z`;
  const ticks = Array.from(
    { length: 24 / v.tickEvery + 1 },
    (_, i) => i * v.tickEvery,
  );

  // CSS reveal (see Reveal.tsx): lines draw in (pathLength 1 + dash offset), fills fade in.
  const draw = (delay: number, duration: number) => ({
    "data-rv": "draw",
    pathLength: 1,
    style: { "--rv-i": 0, "--rv-delay": `${delay}s`, "--rv-dur": `${duration}s` } as CSSProperties,
  });
  const fade = (delay: number) => ({
    "data-rv": "svgfade",
    style: { "--rv-i": 0, "--rv-delay": `${delay}s` } as CSSProperties,
  });

  return (
    <svg
      viewBox={`0 0 ${v.w} ${v.h}`}
      className={className}
      role="img"
      aria-labelledby={`${id}-t ${id}-d`}
      data-rv-trigger=""
      data-rv-amount="0.4"
    >
      <title id={`${id}-t`}>{labels.title}</title>
      <desc id={`${id}-d`}>{labels.desc}</desc>
      <defs>
        <pattern
          id={`${id}-hatch`}
          width={v.stroke * 8}
          height={v.stroke * 8}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2={v.stroke * 8}
            stroke="var(--amber-400)"
            strokeWidth={v.stroke * 1.6}
          />
        </pattern>
        <mask id={`${id}-gap`}>
          <rect x={pad.l} y={ys} width={iw} height={base - ys} fill="white" />
          <path d={area} fill="black" />
        </mask>
        <clipPath id={`${id}-night`}>
          {NIGHT.map(([a, b]) => (
            <rect key={a} x={x(a)} y={0} width={x(b) - x(a)} height={v.h} />
          ))}
        </clipPath>
      </defs>

      {/* Night bands + ticks */}
      {NIGHT.map(([a, b]) => (
        <rect
          key={a}
          x={x(a)}
          y={pad.t - v.font}
          width={x(b) - x(a)}
          height={base - pad.t + v.font}
          fill="var(--night-900)"
          opacity={0.35}
        />
      ))}
      <line
        x1={pad.l}
        x2={v.w - pad.r}
        y1={base}
        y2={base}
        stroke="var(--line-night)"
        strokeWidth={v.stroke}
      />
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={x(t)}
            x2={x(t)}
            y1={base}
            y2={base + v.font * 0.5}
            stroke="var(--line-night)"
            strokeWidth={v.stroke}
          />
          <text
            x={x(t)}
            y={base + v.font * 2}
            textAnchor={t === 0 ? "start" : t === 24 ? "end" : "middle"}
            fontSize={v.font}
            fill="var(--paper-500)"
            fontFamily="var(--font-mono)"
            letterSpacing="0.08em"
          >
            {String(t).padStart(2, "0")}:00
          </text>
        </g>
      ))}

      {/* Paid idle time: gap between staffing and demand, at night */}
      <g {...fade(2.1)} clipPath={`url(#${id}-night)`}>
        <rect
          x={pad.l}
          y={ys}
          width={iw}
          height={base - ys}
          fill={`url(#${id}-hatch)`}
          mask={`url(#${id}-gap)`}
          opacity={0.35}
        />
      </g>

      {/* Demand area + curve */}
      <path
        d={area}
        fill="var(--holo-400)"
        fillOpacity={0.12}
        {...fade(2.1)}
      />
      <path
        d={demand}
        fill="none"
        stroke="var(--holo-400)"
        strokeWidth={v.stroke * 2.5}
        strokeLinecap="round"
        {...draw(0.9, 1.2)}
      />

      {/* Staffed hours: flat */}
      <path
        d={`M${x(0)} ${ys} L${x(24)} ${ys}`}
        stroke="var(--paper-300)"
        strokeWidth={v.stroke * 2}
        strokeLinecap="round"
        fill="none"
        {...draw(0, 0.9)}
      />

      {/* Inline labels (desktop only; mobile uses the HTML legend) */}
      {v.inline && (
        <g
          {...fade(2.3)}
          fontFamily="var(--font-mono)"
          fontSize={v.font}
          letterSpacing="0.1em"
        >
          <text
            x={x(24)}
            y={ys - v.font * 0.8}
            textAnchor="end"
            fill="var(--paper-300)"
          >
            {labels.staffed.toUpperCase()}
          </text>
          <text
            x={x(12.5)}
            y={y(DEMAND_SHAPE[12]) - v.font * 2.2}
            textAnchor="middle"
            fill="var(--holo-300)"
          >
            {labels.demand.toUpperCase()}
          </text>
          <text
            x={x(3.5)}
            y={(ys + base) / 2 + v.font * 0.35}
            textAnchor="middle"
            fill="var(--amber-300)"
          >
            {labels.idle.toUpperCase()}
          </text>
        </g>
      )}
    </svg>
  );
}

export function DemandChart({ labels }: { labels: DemandChartLabels }) {
  return (
    <figure className="flex flex-col gap-4">
      <figcaption className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <span className="text-heading-sm text-paper-50">{labels.title}</span>
        <span className="text-body-sm text-paper-500">{labels.caption}</span>
      </figcaption>
      <ul
        aria-hidden
        className="flex flex-wrap gap-x-5 gap-y-2 text-label text-paper-300 lg:hidden"
      >
        <li className="inline-flex items-center gap-2">
          <span className="h-0.5 w-5 rounded-full bg-paper-300" />
          {labels.staffed}
        </li>
        <li className="inline-flex items-center gap-2 text-holo-300">
          <span className="h-0.5 w-5 rounded-full bg-holo-400" />
          {labels.demand}
        </li>
        <li className="inline-flex items-center gap-2 text-amber-300">
          <span
            className="h-3 w-5 rounded-[2px]"
            style={{
              background:
                "repeating-linear-gradient(45deg, rgba(245,169,74,0.6) 0 2px, transparent 2px 5px)",
            }}
          />
          {labels.idle}
        </li>
      </ul>
      <Chart
        v={DESKTOP}
        labels={labels}
        className="hidden h-auto w-full lg:block"
      />
      <Chart v={MOBILE} labels={labels} className="h-auto w-full lg:hidden" />
    </figure>
  );
}
