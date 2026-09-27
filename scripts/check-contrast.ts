/* Verifies WCAG 2.x contrast of the token pairs used in the design system. Exits 1 on failure. */
const lum = (hex: string) => {
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255);
  const [r, g, b] = c.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const T = {
  mistBg: "#D3DAE1", mistSurface: "#E4E9EE", mistRaised: "#F2F5F8",
  ink900: "#1D1F23", ink700: "#3E4046", ink500: "#5A5E66", lineMist: "#636870", linkMist: "#1C5AA0",
  night900: "#121417", night800: "#1B1D21", charcoal: "#2F3136",
  paper50: "#F4F6F8", paper300: "#C5CAD1", paper500: "#A3AAB4", lineNight: "#7C838E",
  holo300: "#BFE0FF", holo400: "#8CC4FF", holoGradA: "#9DC9FF", holoGradB: "#E6F2FF",
  amber400: "#F5A94A", amber600: "#A85200", amber700: "#8F4500",
  dangerMist: "#A8321F", dangerNight: "#FF8A75", successMist: "#1E6B45", successNight: "#7FD9A8",
};

// [foreground, background, minimum, label]
const pairs: [string, string, number, string][] = [
  [T.ink900, T.mistBg, 4.5, "ink-900 on mist-bg"],
  [T.ink700, T.mistBg, 4.5, "ink-700 on mist-bg"],
  [T.ink500, T.mistBg, 4.5, "ink-500 on mist-bg"],
  [T.ink500, T.mistSurface, 4.5, "ink-500 on mist-surface"],
  [T.linkMist, T.mistBg, 4.5, "link-mist on mist-bg"],
  [T.lineMist, T.mistBg, 3, "line-mist on mist-bg (UI)"],
  [T.lineMist, T.mistSurface, 3, "line-mist on mist-surface (UI)"],
  [T.dangerMist, T.mistBg, 4.5, "danger-mist on mist-bg"],
  [T.successMist, T.mistBg, 4.5, "success-mist on mist-bg"],
  [T.paper50, T.ink900, 4.5, "paper-50 on ink-900 (primary button)"],
  [T.paper50, T.charcoal, 4.5, "paper-50 on charcoal"],
  [T.paper300, T.charcoal, 4.5, "paper-300 on charcoal"],
  [T.paper500, T.charcoal, 4.5, "paper-500 on charcoal"],
  [T.paper300, T.night800, 4.5, "paper-300 on night-800"],
  [T.paper500, T.night800, 4.5, "paper-500 on night-800"],
  [T.lineNight, T.charcoal, 3, "line-night on charcoal (UI)"],
  [T.lineNight, T.night800, 3, "line-night on night-800 (UI)"],
  [T.holo300, T.charcoal, 4.5, "holo-300 on charcoal"],
  [T.holo400, T.charcoal, 4.5, "holo-400 on charcoal"],
  [T.amber400, T.charcoal, 4.5, "amber-400 on charcoal"],
  [T.ink900, T.holoGradA, 4.5, "ink-900 on holo-gradient start"],
  [T.ink900, T.holoGradB, 4.5, "ink-900 on holo-gradient end"],
  [T.ink900, T.amber400, 4.5, "ink-900 on amber-400 (amber CTA)"],
  [T.amber400, T.ink900, 4.5, "amber-400 on ink-900 (figures on ink tiles)"],
  [T.amber400, T.night800, 4.5, "amber-400 on night-800"],
  [T.amber600, T.mistBg, 3, "amber-600 on mist-bg (large text: headline emphasis, figures)"],
  [T.amber600, T.mistRaised, 3, "amber-600 on mist-raised (large text)"],
  [T.amber600, T.holoGradA, 3, "amber-600 on holo-gradient start (large text: 24/7)"],
  [T.amber700, T.mistBg, 4.5, "amber-700 on mist-bg (small text: step counters)"],
  [T.amber700, T.mistSurface, 4.5, "amber-700 on mist-surface (small text)"],
  [T.ink900, T.paper50, 4.5, "ink-900 on paper-50 (night button)"],
  [T.dangerNight, T.night800, 4.5, "danger-night on night-800"],
  [T.successNight, T.night800, 4.5, "success-night on night-800"],
];

let failed = 0;
for (const [fg, bg, min, label] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${label}`);
}
if (failed) {
  console.error(`\n${failed} contrast pair(s) below minimum.`);
  process.exit(1);
}
console.log(`\nAll ${pairs.length} pairs pass.`);
