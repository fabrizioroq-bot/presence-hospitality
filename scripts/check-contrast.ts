/* Verifies WCAG 2.x contrast of the token pairs used in the design system. Exits 1 on failure.
   "Warm Holographic Navy" (02-10): AA is the floor everywhere; body and explanatory text aim for
   7:1 (AAA) and are checked against that target. */
const lum = (hex: string) => {
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255);
  const [r, g, b] = c.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// globals.css :root (--ph-* tokens and their aliases) + "Surfaces".
const T = {
  // light canvases: ivory (+ its dusk end), white (cards, white sections)
  ivory: "#F6F2EC", ivoryDusk: "#EFE8DE", white: "#FFFFFF", highlight: "#E2EBE8",
  text: "#172126", textSecondary: "#344249", muted: "#56636A", petrol: "#173B4D",
  tealText: "#4A6A62", teal: "#5F7F77", borderUi: "#858179", selection: "#CFE2E7",
  cta: "#B74B32", ctaHover: "#963821",
  success: "#2F6F5E", error: "#A63D40", warning: "#8A5D16",
  // dark canvases: petrol (+ dusk end), dark cards, deepest
  dark: "#0F1D25", darkDusk: "#0B171E", night800: "#17272F", night900: "#0A151B",
  paper50: "#FFFFFF", paper300: "#C7D2D7", paper500: "#9DADB4", lineNight: "#627882",
  accentNight: "#9CC2B8", holoBlue: "#63B8D8", holoCyan: "#8BDCE5", holoViolet: "#AFA5CE",
  amber400: "#F5A94A", amber300: "#F8C98B", neon: "#F6B4A0",
  dangerNight: "#FF8A75", successNight: "#7FD9A8",
};

// [foreground, background, minimum, label]
const pairs: [string, string, number, string][] = [];
const AAA = 7;

for (const [name, bg] of [
  ["ivory", T.ivory],
  ["ivory dusk", T.ivoryDusk],
  ["white", T.white],
] as const) {
  pairs.push(
    [T.text, bg, AAA, `body text on ${name}`],
    [T.textSecondary, bg, AAA, `secondary/lead text on ${name}`],
    [T.petrol, bg, AAA, `petrol headline / link on ${name}`],
    [T.muted, bg, 4.5, `muted meta text on ${name}`],
    [T.tealText, bg, 4.5, `teal emphasis on ${name}`],
    [T.borderUi, bg, 3, `control border on ${name} (UI)`],
    [T.petrol, bg, 3, `focus ring on ${name} (UI)`],
    [T.cta, bg, 3, `terracotta button edge on ${name} (UI)`],
    [T.success, bg, 4.5, `success on ${name}`],
    [T.error, bg, 4.5, `error on ${name}`],
    [T.warning, bg, 4.5, `warning on ${name}`],
  );
}

pairs.push(
  // buttons, tiles, selection
  [T.white, T.cta, 4.5, "white on terracotta CTA"],
  [T.white, T.ctaHover, 4.5, "white on terracotta CTA hover"],
  [T.white, T.petrol, AAA, "white on petrol tile / filled control"],
  [T.accentNight, T.petrol, 4.5, "teal-light marker on petrol tile"],
  [T.holoBlue, T.petrol, 3, "key figure gradient start on petrol tile (large)"],
  [T.holoCyan, T.petrol, 4.5, "key figure gradient end on petrol tile"],
  [T.text, T.highlight, AAA, "text on highlight tile"],
  [T.petrol, T.highlight, AAA, "petrol on highlight tile"],
  [T.textSecondary, T.highlight, AAA, "secondary text on highlight tile"],
  [T.text, T.selection, AAA, "text on selection"],
  [T.text, T.neon, AAA, "text on status badge (neon)"],
  [T.text, T.accentNight, AAA, "text on status badge (teal-light)"],
);

for (const [name, bg] of [
  ["dark", T.dark],
  ["dark dusk", T.darkDusk],
  ["dark card", T.night800],
  ["deepest", T.night900],
] as const) {
  pairs.push(
    [T.paper50, bg, AAA, `white on ${name}`],
    [T.paper300, bg, AAA, `secondary text on ${name}`],
    [T.paper500, bg, 4.5, `captions on ${name}`],
    [T.lineNight, bg, 3, `control border on ${name} (UI)`],
    [T.accentNight, bg, 4.5, `teal-light checks/links on ${name}`],
    [T.holoBlue, bg, 4.5, `hologram blue (emphasis start) on ${name}`],
    [T.holoCyan, bg, 4.5, `hologram cyan (emphasis end) on ${name}`],
    [T.holoViolet, bg, 4.5, `hologram violet on ${name}`],
    [T.amber400, bg, 4.5, `amber "paid idle time" on ${name}`],
    [T.amber300, bg, 4.5, `amber legend on ${name}`],
    [T.dangerNight, bg, 4.5, `error on ${name}`],
    [T.successNight, bg, 4.5, `success on ${name}`],
  );
}

// The CTA edge only needs 3:1 where the button sits on a page canvas; on dark cards its white label
// (5.2:1) identifies it, which WCAG 1.4.11 accepts for text buttons.
pairs.push([T.cta, T.dark, 3, "terracotta button edge on dark canvas (UI)"], [T.cta, T.darkDusk, 3, "terracotta button edge on dark dusk (UI)"]);

// Pitch theme (kit.css, [data-theme="pitch" | "pitch-dark"]). Card and chip fills are translucent
// white, so they are checked as blended over their canvas (30% on mist, 6% on charcoal).
const P = {
  mist: "#D5DBE2", charcoal: "#3E3E40", ink: "#2E2E30", inkMuted: "#3E3E40", paper2: "#EBECEE", paperMuted: "#DFE0E3",
  pillFrom: "#A9CBF3", pillTo: "#E4EEFA", white: "#FFFFFF",
};
const blend = (fg: string, bg: string, a: number) =>
  "#" + [0, 2, 4].map((i) => Math.round(a * parseInt(fg.slice(1 + i, 3 + i), 16) + (1 - a) * parseInt(bg.slice(1 + i, 3 + i), 16)).toString(16).padStart(2, "0")).join("");
const mistCard = blend(P.white, P.mist, 0.3);
const charcoalCard = blend(P.white, P.charcoal, 0.06);
for (const [name, bg] of [["pitch mist", P.mist], ["pitch card on mist", mistCard]] as const) {
  pairs.push(
    [P.ink, bg, AAA, `text on ${name}`],
    [P.inkMuted, bg, 4.5, `muted text on ${name}`],
    [T.petrol, bg, 3, `logo (petrol) on ${name} (UI)`],
    [P.charcoal, bg, 3, `focus ring / control line on ${name} (UI)`],
  );
}
for (const [name, bg] of [["pitch charcoal", P.charcoal], ["pitch card on charcoal", charcoalCard]] as const) {
  pairs.push(
    [P.white, bg, AAA, `white text on ${name}`],
    [P.paper2, bg, AAA, `secondary text on ${name}`],
    [P.paperMuted, bg, 4.5, `muted text on ${name}`],
    [P.white, bg, 3, `focus ring / outline on ${name} (UI)`],
  );
}
pairs.push(
  [P.ink, P.pillFrom, AAA, "ink on pill / highlight gradient start"],
  [P.ink, P.pillTo, AAA, "ink on pill / highlight gradient end"],
  [P.ink, P.white, AAA, "ink on number circle"],
  [P.charcoal, P.white, AAA, "charcoal on white button"],
  [P.white, P.charcoal, AAA, "white on charcoal button / lit number"],
);

// Washed-out projector (pitch only): a lit room lifts the black level to ~1/10 of white, i.e. every
// luminance gains K = 1/9. Text must still reach 4.5:1 under that model.
const K = 1 / 9;
const projected = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + K) / (lo + K);
};
const projector: [string, string, string][] = [
  [P.ink, P.mist, "text on pitch mist"],
  [P.inkMuted, P.mist, "meta text on pitch mist"],
  [P.ink, mistCard, "text on pitch card on mist"],
  [P.white, P.charcoal, "white text on pitch charcoal"],
  [P.paper2, P.charcoal, "secondary text on pitch charcoal"],
  [P.paperMuted, P.charcoal, "meta text on pitch charcoal"],
  [P.paperMuted, charcoalCard, "meta text on pitch card on charcoal"],
  [P.ink, P.pillFrom, "ink on pill gradient start"],
  [P.ink, P.white, "ink on number circle"],
];
let projectorFailed = 0;
for (const [fg, bg, label] of projector) {
  const r = projected(fg, bg);
  if (r < 4.5) projectorFailed++;
  console.log(`${r >= 4.5 ? "PASS" : "FAIL"}  ${r.toFixed(2).padStart(5)}:1  (min 4.5, projector)  ${label}`);
}

let failed = projectorFailed;
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
