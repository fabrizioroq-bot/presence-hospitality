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

// Warm palette (globals.css :root + "Section tones").
const T = {
  // light canvases: lavender light (default, + its dusk end), ivory tone, ivory card surface, lavender mist tone
  mistBg: "#EEEAF3", mistDusk: "#E4DDEC", ivory: "#F7F3EE", ivorySurface: "#FDFBF8", lavender: "#CFC7D9",
  ink900: "#221B29", ink700: "#463B52", ink500: "#584B65", lineMist: "#73678A", lineLavender: "#6A5E80",
  linkMist: "#4A36A0", focus: "#4535A8", selection: "#D9CCF5",
  // dark canvases: deep plum (+ dusk end), dark cards, deepest
  charcoal: "#2B2233", charcoalDusk: "#241C2B", night800: "#221A29", night900: "#1A1420",
  paper50: "#F6F2F8", paper300: "#D4CBDD", paper500: "#AEA3BA", lineNight: "#887C95",
  holo300: "#BFE0FF", holo400: "#8CC4FF", highlightA: "#D5C8F2", highlightB: "#F7F3EE",
  amber400: "#F5A94A",
  // accent: CTA gradient blue-700 → cyan-700 (violet); emphasis blue-700 → teal-700 on light, holo-400 → cyan-300 on dark
  blue700: "#2F4FD8", cyan700: "#7B61C9", teal700: "#6A4CB4", cyan300: "#B9A2F2",
  lavBlue700: "#2A43B8", lavTeal700: "#563D97", white: "#FFFFFF",
  dangerMist: "#A8321F", dangerNight: "#FF8A75", successMist: "#1E6B45", successNight: "#7FD9A8",
};

// [foreground, background, minimum, label]
const pairs: [string, string, number, string][] = [];

for (const [name, bg] of [
  ["lavender light", T.mistBg],
  ["lavender light dusk", T.mistDusk],
  ["ivory", T.ivory],
  ["ivory surface", T.ivorySurface],
] as const) {
  pairs.push(
    [T.ink900, bg, 4.5, `ink-900 on ${name}`],
    [T.ink700, bg, 4.5, `ink-700 on ${name}`],
    [T.ink500, bg, 4.5, `ink-500 on ${name}`],
    [T.lineMist, bg, 3, `line-mist on ${name} (UI)`],
    [T.linkMist, bg, 4.5, `link-mist on ${name}`],
    [T.focus, bg, 3, `focus ring on ${name} (UI)`],
    [T.blue700, bg, 4.5, `emphasis blue-700 on ${name}`],
    [T.teal700, bg, 4.5, `emphasis violet teal-700 on ${name}`],
    [T.dangerMist, bg, 4.5, `danger-mist on ${name}`],
    [T.successMist, bg, 4.5, `success-mist on ${name}`],
  );
}

pairs.push(
  // lavender mist tone (overrides line, blue-700 and teal-700 locally)
  [T.ink900, T.lavender, 4.5, "ink-900 on lavender mist"],
  [T.ink700, T.lavender, 4.5, "ink-700 on lavender mist"],
  [T.ink500, T.lavender, 4.5, "ink-500 on lavender mist"],
  [T.lineLavender, T.lavender, 3, "line on lavender mist (UI)"],
  [T.linkMist, T.lavender, 4.5, "link-mist on lavender mist"],
  [T.focus, T.lavender, 3, "focus ring on lavender mist (UI)"],
  [T.lavBlue700, T.lavender, 4.5, "emphasis blue on lavender mist"],
  [T.lavTeal700, T.lavender, 4.5, "emphasis violet on lavender mist"],
  // buttons
  [T.white, T.blue700, 4.5, "white on blue-700 (CTA start)"],
  [T.white, T.cyan700, 4.5, "white on cyan-700 (CTA end)"],
  [T.white, T.lavBlue700, 4.5, "white on CTA start (lavender tone)"],
  [T.paper50, T.ink900, 4.5, "paper-50 on ink-900 (primary button)"],
  [T.ink900, T.paper50, 4.5, "ink-900 on paper-50 (night button)"],
  [T.ink900, T.selection, 4.5, "ink-900 on text selection"],
  // highlight gradient (tiles, glow buttons, package tabs)
  [T.ink900, T.highlightA, 4.5, "ink-900 on highlight gradient start"],
  [T.ink900, T.highlightB, 4.5, "ink-900 on highlight gradient end"],
  [T.ink700, T.highlightA, 4.5, "ink-700 on highlight gradient start"],
  [T.blue700, T.highlightA, 3, "blue-700 on highlight gradient (large: 24/7)"],
  [T.teal700, T.highlightA, 3, "teal-700 on highlight gradient (large)"],
  [T.lavBlue700, T.highlightA, 4.5, "emphasis blue (lavender tone) on highlight gradient"],
  [T.lavTeal700, T.highlightA, 4.5, "emphasis violet (lavender tone) on highlight gradient"],
);

for (const bg of [T.charcoal, T.charcoalDusk, T.night800, T.night900]) {
  pairs.push(
    [T.paper50, bg, 4.5, `paper-50 on ${bg}`],
    [T.paper300, bg, 4.5, `paper-300 on ${bg}`],
    [T.paper500, bg, 4.5, `paper-500 on ${bg}`],
    [T.lineNight, bg, 3, `line-night on ${bg} (UI)`],
    [T.holo300, bg, 4.5, `holo-300 on ${bg}`],
    [T.holo400, bg, 4.5, `holo-400 on ${bg} (emphasis start)`],
    [T.cyan300, bg, 4.5, `cyan-300 on ${bg} (emphasis end, focus on night)`],
    [T.amber400, bg, 4.5, `amber-400 on ${bg}`],
    [T.dangerNight, bg, 4.5, `danger-night on ${bg}`],
    [T.successNight, bg, 4.5, `success-night on ${bg}`],
  );
}
pairs.push(
  [T.amber400, T.ink900, 4.5, "amber-400 on ink-900 (figures on ink tiles)"],
  [T.cyan300, T.ink900, 4.5, "cyan-300 on ink-900 (key figure on ink tile)"],
  [T.holo400, T.ink900, 4.5, "holo-400 on ink-900 (key figure on ink tile)"],
);

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
