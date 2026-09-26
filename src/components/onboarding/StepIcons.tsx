// Pitch-style outline illustrations for the six onboarding steps (1.5px strokes, currentColor).
const common = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "h-10 w-10",
};

export const stepIcons = [
  // 01 Intake & site survey: clipboard with ticks
  <svg key="1" {...common}>
    <rect x="11" y="8" width="26" height="34" rx="3" />
    <path d="M19 8v-2h10v2" />
    {[18, 26, 34].map((y) => (
      <g key={y}>
        <path d={`M16 ${y}l2 2 3-4`} />
        <path d={`M25 ${y}h7`} />
      </g>
    ))}
  </svg>,
  // 02 Service design: scope sliders
  <svg key="2" {...common}>
    <rect x="8" y="9" width="32" height="30" rx="3" />
    {[
      [17, 22],
      [24, 30],
      [31, 18],
    ].map(([y, x]) => (
      <g key={y}>
        <path d={`M14 ${y}h20`} />
        <circle cx={x} cy={y} r="2.5" fill="var(--mist-surface)" />
      </g>
    ))}
  </svg>,
  // 03 Holobox installation: box with a figure
  <svg key="3" {...common}>
    <rect x="14" y="5" width="20" height="38" rx="5" />
    <circle cx="24" cy="16" r="3" />
    <path d="M19.5 33v-7c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v7" />
    <ellipse cx="24" cy="37" rx="6" ry="1.5" />
  </svg>,
  // 04 Integration: hub with connected systems
  <svg key="4" {...common}>
    <circle cx="24" cy="24" r="5" />
    {[
      [10, 12],
      [38, 12],
      [10, 36],
      [38, 36],
    ].map(([x, y]) => (
      <g key={`${x}${y}`}>
        <rect x={x - 4} y={y - 4} width="8" height="8" rx="2" />
        <path d={`M${x + (x < 24 ? 4 : -4)} ${y + (y < 24 ? 4 : -4)}L${24 + (x < 24 ? -3.5 : 3.5)} ${24 + (y < 24 ? -3.5 : 3.5)}`} />
      </g>
    ))}
  </svg>,
  // 05 Playbook & training: open book
  <svg key="5" {...common}>
    <path d="M24 13c-4-3-10-3-16-2v26c6-1 12-1 16 2 4-3 10-3 16-2V11c-6-1-12-1-16 2z" />
    <path d="M24 13v26" />
    <path d="M12 18h7M12 23h7M29 18h7M29 23h7" />
  </svg>,
  // 06 Pilot & go-live: LIVE badge with broadcast waves (pitch slide 9)
  <svg key="6" {...common}>
    <rect x="5" y="16" width="38" height="16" rx="8" />
    <circle cx="13" cy="24" r="1.8" fill="currentColor" />
    <path d="M9.5 20.5a5 5 0 000 7M16.5 20.5a5 5 0 010 7" />
    <path d="M22 20.5v7h4M29 20.5v7M32 20.5l2 7 2-7M40.5 20.5h-2.5v7h2.5M38 24h2" />
  </svg>,
];
