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
  amber400: "#F5A94A",
  blue700: "#1747A6", teal700: "#0B6485", cyan700: "#0A7BA3", cyan300: "#6FE3FF", white: "#FFFFFF",
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
  // Day → night: the dusk end of the mist and night canvases (DayNight + globals.css).
  [T.ink500, "#D2D8E8", 4.5, "ink-500 on mist dusk"],
  [T.linkMist, "#D2D8E8", 4.5, "link-mist on mist dusk"],
  [T.lineMist, "#D2D8E8", 3, "line-mist on mist dusk (UI)"],
  ["#1747A6", "#D2D8E8", 4.5, "blue-700 on mist dusk"],
  ["#0B6485", "#D2D8E8", 4.5, "teal-700 on mist dusk"],
  [T.paper500, "#24272E", 4.5, "paper-500 on night dusk"],
  [T.lineNight, "#24272E", 3, "line-night on night dusk (UI)"],
  // Blue accent: every gradient stop must pass on its background.
  [T.blue700, T.mistBg, 4.5, "blue-700 on mist-bg (emphasis / step labels)"],
  [T.teal700, T.mistBg, 4.5, "teal-700 on mist-bg (emphasis end / step labels)"],
  [T.teal700, T.holoGradA, 3, "teal-700 on holo-gradient start (large: 24/7)"],
  [T.white, T.blue700, 4.5, "white on blue-700 (CTA start)"],
  [T.white, T.cyan700, 4.5, "white on cyan-700 (CTA end)"],
  [T.cyan300, T.charcoal, 4.5, "cyan-300 on charcoal (emphasis on night)"],
  [T.cyan300, T.night900, 4.5, "cyan-300 on night-900"],
  [T.ink900, T.paper50, 4.5, "ink-900 on paper-50 (night button)"],
  [T.dangerNight, T.night800, 4.5, "danger-night on night-800"],
  [T.successNight, T.night800, 4.5, "success-night on night-800"],
];

// Warm palette preview (?palette=a|b, globals.css "Warm palette preview").
const W = {
  lavLight: "#EEEAF3", lavLightDusk: "#E4DDEC", ivory: "#F7F3EE", ivorySurface: "#FDFBF8", lavender: "#CFC7D9",
  ink900: "#221B29", ink700: "#463B52", ink500: "#584B65", lineMist: "#73678A", lineLav: "#6A5E80",
  link: "#4A36A0", focus: "#4535A8", ctaA: "#2F4FD8", ctaB: "#7B61C9", violet: "#6E5A8A", violetB: "#6A4CB4",
  lavBlue: "#2A43B8", lavViolet: "#584872", lavVioletB: "#563D97",
  aCharcoal: "#3B3247", aDusk: "#342B40", aNight800: "#312939", aNight900: "#261F2D",
  bCharcoal: "#2B2233", bDusk: "#241C2B", bNight800: "#221A29", bNight900: "#1A1420",
  paper50: "#F6F2F8", paper300: "#D4CBDD", aPaper500: "#BDB2C8", bPaper500: "#AEA3BA",
  aLineNight: "#968AA4", bLineNight: "#887C95", aEmphDark: "#C7B8F0", bEmphDark: "#B9A2F2", selection: "#D9CCF5",
};
for (const [bgName, bg] of [["lavender light", W.lavLight], ["lavender light dusk", W.lavLightDusk], ["ivory", W.ivory], ["ivory surface", W.ivorySurface]] as const) {
  pairs.push(
    [W.ink900, bg, 4.5, `palette: ink-900 on ${bgName}`],
    [W.ink700, bg, 4.5, `palette: ink-700 on ${bgName}`],
    [W.ink500, bg, 4.5, `palette: ink-500 on ${bgName}`],
    [W.lineMist, bg, 3, `palette: line-mist on ${bgName} (UI)`],
    [W.link, bg, 4.5, `palette: link on ${bgName}`],
    [W.focus, bg, 3, `palette: focus ring on ${bgName} (UI)`],
    [W.ctaA, bg, 4.5, `palette: emphasis blue on ${bgName}`],
    [W.violet, bg, 4.5, `palette: emphasis violet (A) on ${bgName}`],
    [W.violetB, bg, 4.5, `palette: emphasis violet (B) on ${bgName}`],
    [T.dangerMist, bg, 4.5, `palette: danger on ${bgName}`],
    [T.successMist, bg, 4.5, `palette: success on ${bgName}`],
  );
}
pairs.push(
  [W.ink900, W.lavender, 4.5, "palette: ink-900 on lavender mist"],
  [W.ink700, W.lavender, 4.5, "palette: ink-700 on lavender mist"],
  [W.ink500, W.lavender, 4.5, "palette: ink-500 on lavender mist"],
  [W.lineLav, W.lavender, 3, "palette: line on lavender mist (UI)"],
  [W.link, W.lavender, 4.5, "palette: link on lavender mist"],
  [W.lavBlue, W.lavender, 4.5, "palette: emphasis blue on lavender mist"],
  [W.lavViolet, W.lavender, 4.5, "palette: emphasis violet (A) on lavender mist"],
  [W.lavVioletB, W.lavender, 4.5, "palette: emphasis violet (B) on lavender mist"],
  [W.focus, W.lavender, 3, "palette: focus ring on lavender mist (UI)"],
  [T.white, W.ctaA, 4.5, "palette: white on CTA start"],
  [T.white, W.ctaB, 4.5, "palette: white on CTA end"],
  [T.white, W.lavBlue, 4.5, "palette: white on CTA start (lavender tone)"],
  [W.ink900, W.paper50, 4.5, "palette: ink-900 on paper-50 (night button)"],
  [W.ink900, W.selection, 4.5, "palette: ink-900 on selection"],
  [W.ink900, "#D5C8F2", 4.5, "palette: ink-900 on highlight gradient start"],
  [W.ink700, "#D5C8F2", 4.5, "palette: ink-700 on highlight gradient start"],
  [W.ctaA, "#D5C8F2", 3, "palette: emphasis blue on highlight gradient (large: 24/7)"],
  [W.violet, "#D5C8F2", 3, "palette: emphasis violet A on highlight gradient (large)"],
  [W.violetB, "#D5C8F2", 3, "palette: emphasis violet B on highlight gradient (large)"],
  [W.lavBlue, "#D5C8F2", 4.5, "palette: emphasis blue (lavender tone) on highlight gradient"],
  [W.lavVioletB, "#D5C8F2", 4.5, "palette: emphasis violet (lavender tone) on highlight gradient"],
);
for (const [v, bgs, p500, line, emph] of [
  ["A", [W.aCharcoal, W.aDusk, W.aNight800, W.aNight900, W.bCharcoal, W.bNight800], W.aPaper500, W.aLineNight, W.aEmphDark],
  ["B", [W.bCharcoal, W.bDusk, W.bNight800, W.bNight900], W.bPaper500, W.bLineNight, W.bEmphDark],
] as const) {
  for (const bg of bgs) {
    pairs.push(
      [W.paper50, bg, 4.5, `palette ${v}: paper-50 on ${bg}`],
      [W.paper300, bg, 4.5, `palette ${v}: paper-300 on ${bg}`],
      [p500, bg, 4.5, `palette ${v}: paper-500 on ${bg}`],
      [line, bg, 3, `palette ${v}: line-night on ${bg} (UI)`],
      [T.holo400, bg, 4.5, `palette ${v}: holo-400 on ${bg}`],
      [T.holo300, bg, 4.5, `palette ${v}: holo-300 on ${bg}`],
      [emph, bg, 4.5, `palette ${v}: emphasis violet on ${bg}`],
      [T.amber400, bg, 4.5, `palette ${v}: amber-400 on ${bg}`],
      [T.dangerNight, bg, 4.5, `palette ${v}: danger-night on ${bg}`],
      [T.successNight, bg, 4.5, `palette ${v}: success-night on ${bg}`],
    );
  }
}

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
