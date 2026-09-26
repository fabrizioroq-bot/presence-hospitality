/**
 * Generates the hologram agent point cloud from signed distance functions.
 *
 * Outputs
 *  - public/hologram/agent-60k.bin  (high/mid tiers; shuffled, so any prefix is a uniform subset)
 *  - public/hologram/agent-12k.bin  (low/reduced tiers)
 *  - src/components/hologram/poster-points.ts (front-view dots for the SVG poster)
 *
 * Binary layout, 8 bytes per point, little-endian:
 *   u16 x, u16 y, u16 z  — quantised over BOUNDS
 *   u8  random           — 0..255
 *   u8  flags            — bit0: warm (amber) point, bit1: interior sparkle, bit2: orbit dust
 *
 * Run: npx tsx scripts/generate-agent-points.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";

type V3 = [number, number, number];

export const BOUNDS = { min: [-0.6, 0, -0.6] as V3, max: [0.6, 1.9, 0.6] as V3 };

// ---------- seeded PRNG ----------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260925);

// ---------- SDF primitives ----------
const len = (x: number, y: number, z: number) => Math.hypot(x, y, z);

function sdEllipsoid(p: V3, c: V3, r: V3) {
  const x = (p[0] - c[0]) / r[0];
  const y = (p[1] - c[1]) / r[1];
  const z = (p[2] - c[2]) / r[2];
  const k0 = len(x, y, z);
  const k1 = len(x / r[0], y / r[1], z / r[2]);
  return (k0 * (k0 - 1)) / k1;
}

function sdCapsule(p: V3, a: V3, b: V3, r: number) {
  const pa = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const ba = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const h = Math.min(
    1,
    Math.max(0, (pa[0] * ba[0] + pa[1] * ba[1] + pa[2] * ba[2]) / (ba[0] ** 2 + ba[1] ** 2 + ba[2] ** 2)),
  );
  return len(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - r;
}

function sdRoundBox(p: V3, c: V3, b: V3, r: number) {
  const q = [
    Math.abs(p[0] - c[0]) - b[0] + r,
    Math.abs(p[1] - c[1]) - b[1] + r,
    Math.abs(p[2] - c[2]) - b[2] + r,
  ];
  return (
    len(Math.max(q[0], 0), Math.max(q[1], 0), Math.max(q[2], 0)) +
    Math.min(Math.max(q[0], Math.max(q[1], q[2])), 0) -
    r
  );
}

function smin(a: number, b: number, k: number) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

// ---------- the receptionist: standing, hands clasped at the waist ----------
function body(p: V3): number {
  // mirror for symmetric limbs
  const m: V3 = [Math.abs(p[0]), p[1], p[2]];

  // Head: cranium + jaw, hair cap and a low bun.
  const cranium = sdEllipsoid(p, [0, 1.645, 0.0], [0.074, 0.092, 0.088]);
  const jaw = sdEllipsoid(p, [0, 1.585, 0.022], [0.056, 0.058, 0.066]);
  const hair = sdEllipsoid(p, [0, 1.672, -0.014], [0.082, 0.078, 0.094]);
  const bun = sdEllipsoid(p, [0, 1.64, -0.1], [0.044, 0.042, 0.04]);
  const neck = sdCapsule(p, [0, 1.47, -0.008], [0, 1.555, 0.004], 0.037);

  // Blazer torso: sloped shoulders, fitted waist, hem at the hips.
  const shoulders = sdCapsule(m, [0.04, 1.455, -0.01], [0.175, 1.41, -0.012], 0.052);
  const chest = sdRoundBox(p, [0, 1.3, 0.006], [0.15, 0.12, 0.088], 0.075);
  const waist = sdRoundBox(p, [0, 1.11, 0], [0.118, 0.1, 0.074], 0.066);
  const hips = sdRoundBox(p, [0, 0.95, 0], [0.152, 0.085, 0.088], 0.07);

  // Arms: elbows slightly out, forearms folding in, hands clasped at the front.
  const upperArm = sdCapsule(m, [0.18, 1.395, -0.012], [0.198, 1.13, 0.004], 0.04);
  const foreArm = sdCapsule(m, [0.198, 1.13, 0.004], [0.062, 0.99, 0.1], 0.032);
  const hand = sdEllipsoid(m, [0.022, 0.975, 0.112], [0.046, 0.034, 0.036]);

  // Trousers + shoes, feet close together.
  const thigh = sdCapsule(m, [0.078, 0.9, 0], [0.072, 0.49, 0.008], 0.068);
  const shin = sdCapsule(m, [0.072, 0.49, 0.008], [0.068, 0.09, -0.008], 0.047);
  const shoe = sdRoundBox(m, [0.07, 0.034, 0.03], [0.04, 0.034, 0.088], 0.028);

  let d = smin(cranium, jaw, 0.04);
  d = smin(d, hair, 0.025);
  d = smin(d, bun, 0.02);
  d = smin(d, neck, 0.035);
  let torso = smin(chest, waist, 0.09);
  torso = smin(torso, hips, 0.07);
  torso = smin(torso, shoulders, 0.07);
  d = smin(d, torso, 0.045);
  d = smin(d, upperArm, 0.03);
  d = smin(d, foreArm, 0.025);
  d = smin(d, hand, 0.018);
  d = smin(d, smin(thigh, shin, 0.04), 0.05);
  d = smin(d, shoe, 0.02);
  return d;
}

function normal(p: V3): V3 {
  const e = 0.0015;
  const nx = body([p[0] + e, p[1], p[2]]) - body([p[0] - e, p[1], p[2]]);
  const ny = body([p[0], p[1] + e, p[2]]) - body([p[0], p[1] - e, p[2]]);
  const nz = body([p[0], p[1], p[2] + e]) - body([p[0], p[1], p[2] - e]);
  const l = len(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}

// ---------- sampling ----------
type Pt = { p: V3; flags: number };
const TOTAL = 60000;
const N_ORBIT = Math.round(TOTAL * 0.03);
const N_INTERIOR = Math.round(TOTAL * 0.09);
const N_SURFACE = TOTAL - N_ORBIT - N_INTERIOR;

const box = { min: [-0.34, 0, -0.2] as V3, max: [0.34, 1.8, 0.24] as V3 };
const inBox = (): V3 => [
  box.min[0] + rand() * (box.max[0] - box.min[0]),
  box.min[1] + rand() * (box.max[1] - box.min[1]),
  box.min[2] + rand() * (box.max[2] - box.min[2]),
];

const pts: Pt[] = [];

// Surface shell, projected onto the surface with a tiny jitter.
while (pts.length < N_SURFACE) {
  const p = inBox();
  const d = body(p);
  if (Math.abs(d) > 0.02) continue;
  const n = normal(p);
  const j = (rand() - 0.5) * 0.006;
  const q: V3 = [p[0] - n[0] * (d - j), p[1] - n[1] * (d - j), p[2] - n[2] * (d - j)];
  // Name badge on the wearer's left chest, plus a sprinkle of warm rim points.
  const badge = len(q[0] - 0.085, q[1] - 1.33, q[2] - 0.095) < 0.024 && n[2] > 0.4;
  const warm = badge || rand() < 0.012;
  pts.push({ p: q, flags: warm ? 1 : 0 });
}

// Interior sparkle.
while (pts.length < N_SURFACE + N_INTERIOR) {
  const p = inBox();
  if (body(p) < -0.015) pts.push({ p, flags: 2 });
}

// Orbit dust on a vertical cylinder around the body.
for (let i = 0; i < N_ORBIT; i++) {
  const a = rand() * Math.PI * 2;
  const r = 0.42 + rand() * 0.1;
  pts.push({ p: [Math.cos(a) * r, rand() * 1.85, Math.sin(a) * r], flags: 4 });
}

// Shuffle so any prefix is a uniform subset (tiers take the first N points).
for (let i = pts.length - 1; i > 0; i--) {
  const k = Math.floor(rand() * (i + 1));
  [pts[i], pts[k]] = [pts[k], pts[i]];
}

// ---------- encode ----------
function encode(list: Pt[]) {
  const buf = Buffer.alloc(list.length * 8);
  list.forEach(({ p, flags }, i) => {
    const o = i * 8;
    for (let a = 0; a < 3; a++) {
      const t = (p[a] - BOUNDS.min[a]) / (BOUNDS.max[a] - BOUNDS.min[a]);
      buf.writeUInt16LE(Math.round(Math.min(1, Math.max(0, t)) * 65535), o + a * 2);
    }
    buf.writeUInt8(Math.floor(rand() * 256), o + 6);
    buf.writeUInt8(flags, o + 7);
  });
  return buf;
}

mkdirSync("public/hologram", { recursive: true });
writeFileSync("public/hologram/agent-60k.bin", encode(pts));
writeFileSync("public/hologram/agent-12k.bin", encode(pts.slice(0, 12000)));

// ---------- poster: front view (x, y) of 1,400 surface points, SVG units 0..300 x 0..600 ----------
const poster = pts
  .filter((q) => q.flags !== 4 && q.flags !== 2)
  .slice(0, 1400)
  .map(({ p, flags }) => {
    const x = Math.round((p[0] / 0.5) * 150 + 150);
    const y = Math.round(600 - (p[1] / 1.85) * 580 - 10);
    return [x, y, flags & 1] as const;
  });

const cool = poster.filter((d) => !d[2]).map(([x, y]) => `M${x} ${y}h0`).join("");
const warm = poster.filter((d) => d[2]).map(([x, y]) => `M${x} ${y}h0`).join("");

writeFileSync(
  "src/components/hologram/poster-points.ts",
  `// Generated by scripts/generate-agent-points.ts — do not edit.\n` +
    `export const POSTER_VIEWBOX = "0 0 300 600";\n` +
    `export const POSTER_COOL = ${JSON.stringify(cool)};\n` +
    `export const POSTER_WARM = ${JSON.stringify(warm)};\n`,
);

console.log(
  `points: ${pts.length} (surface ${N_SURFACE}, interior ${N_INTERIOR}, orbit ${N_ORBIT}); poster dots: ${poster.length}`,
);

// =====================================================================================
// Guest (the traveller in the "How it works" story): coat, short hair, rolling suitcase.
// Same dot language as the agent; rendered warm (human) vs the agent's cool holo.
// Outputs public/hologram/guest-9k.bin (flags bit0 = suitcase) + guest poster paths.
// =====================================================================================
function suitcase(p: V3): number {
  const shell = sdRoundBox(p, [0.44, 0.36, 0], [0.15, 0.27, 0.1], 0.035);
  const wheelL = sdEllipsoid(p, [0.35, 0.055, 0.03], [0.03, 0.03, 0.03]);
  const wheelR = sdEllipsoid(p, [0.53, 0.055, 0.03], [0.03, 0.03, 0.03]);
  const rodA = sdCapsule(p, [0.4, 0.63, -0.02], [0.37, 0.9, -0.02], 0.011);
  const rodB = sdCapsule(p, [0.48, 0.63, -0.02], [0.45, 0.9, -0.02], 0.011);
  const bar = sdCapsule(p, [0.36, 0.9, -0.02], [0.46, 0.9, -0.02], 0.016);
  return Math.min(shell, wheelL, wheelR, rodA, rodB, bar);
}

function guestBody(p: V3): number {
  const m: V3 = [Math.abs(p[0]), p[1], p[2]];
  const cranium = sdEllipsoid(p, [0, 1.64, 0], [0.078, 0.095, 0.09]);
  const jaw = sdEllipsoid(p, [0, 1.58, 0.02], [0.058, 0.058, 0.066]);
  const hair = sdEllipsoid(p, [0, 1.683, -0.012], [0.084, 0.068, 0.094]);
  const neck = sdCapsule(p, [0, 1.47, -0.008], [0, 1.555, 0.004], 0.04);
  const shoulders = sdCapsule(m, [0.05, 1.45, -0.01], [0.19, 1.415, -0.012], 0.055);
  const chest = sdRoundBox(p, [0, 1.3, 0.005], [0.165, 0.13, 0.095], 0.08);
  const coat = sdRoundBox(p, [0, 1.0, 0], [0.165, 0.28, 0.1], 0.08); // long coat to mid-thigh
  // Relaxed arm (wearer's right, -x) and the arm pulling the suitcase (+x).
  const armL = smin(sdCapsule(p, [-0.19, 1.4, -0.012], [-0.225, 1.12, 0.01], 0.042), sdCapsule(p, [-0.225, 1.12, 0.01], [-0.215, 0.88, 0.04], 0.036), 0.03);
  const handL = sdEllipsoid(p, [-0.212, 0.84, 0.04], [0.035, 0.05, 0.03]);
  const armR = smin(sdCapsule(p, [0.19, 1.4, -0.012], [0.25, 1.13, 0], 0.042), sdCapsule(p, [0.25, 1.13, 0], [0.33, 0.93, -0.01], 0.036), 0.03);
  const handR = sdEllipsoid(p, [0.345, 0.9, -0.015], [0.04, 0.045, 0.035]);
  const thigh = sdCapsule(m, [0.08, 0.8, 0], [0.085, 0.47, 0.008], 0.066);
  const shin = sdCapsule(m, [0.085, 0.47, 0.008], [0.08, 0.09, -0.008], 0.047);
  const shoe = sdRoundBox(m, [0.08, 0.035, 0.04], [0.042, 0.035, 0.095], 0.028);

  let d = smin(cranium, jaw, 0.04);
  d = smin(d, hair, 0.02);
  d = smin(d, neck, 0.035);
  let torso = smin(chest, coat, 0.1);
  torso = smin(torso, shoulders, 0.07);
  d = smin(d, torso, 0.045);
  d = smin(d, smin(armL, handL, 0.02), 0.03);
  d = smin(d, smin(armR, handR, 0.02), 0.03);
  d = smin(d, smin(thigh, shin, 0.04), 0.05);
  d = smin(d, shoe, 0.02);
  return Math.min(d, suitcase(p));
}

function gNormal(p: V3): V3 {
  const e = 0.0015;
  const f = guestBody;
  const nx = f([p[0] + e, p[1], p[2]]) - f([p[0] - e, p[1], p[2]]);
  const ny = f([p[0], p[1] + e, p[2]]) - f([p[0], p[1] - e, p[2]]);
  const nz = f([p[0], p[1], p[2] + e]) - f([p[0], p[1], p[2] - e]);
  const l = len(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}

const G_TOTAL = 9000;
const G_INTERIOR = 700;
const gBox = { min: [-0.3, 0, -0.2] as V3, max: [0.62, 1.8, 0.24] as V3 };
const gIn = (): V3 => [
  gBox.min[0] + rand() * (gBox.max[0] - gBox.min[0]),
  gBox.min[1] + rand() * (gBox.max[1] - gBox.min[1]),
  gBox.min[2] + rand() * (gBox.max[2] - gBox.min[2]),
];
const guest: Pt[] = [];
while (guest.length < G_TOTAL - G_INTERIOR) {
  const p = gIn();
  const d = guestBody(p);
  if (Math.abs(d) > 0.02) continue;
  const n = gNormal(p);
  const j = (rand() - 0.5) * 0.006;
  const q: V3 = [p[0] - n[0] * (d - j), p[1] - n[1] * (d - j), p[2] - n[2] * (d - j)];
  guest.push({ p: q, flags: suitcase(q) < 0.015 ? 1 : 0 });
}
while (guest.length < G_TOTAL) {
  const p = gIn();
  if (guestBody(p) < -0.015) guest.push({ p, flags: 2 | (suitcase(p) < 0 ? 1 : 0) });
}
for (let i = guest.length - 1; i > 0; i--) {
  const k = Math.floor(rand() * (i + 1));
  [guest[i], guest[k]] = [guest[k], guest[i]];
}
writeFileSync("public/hologram/guest-9k.bin", encode(guest));

// Guest poster: front view, same scale as the agent poster (300 units per world unit), feet centre at x=120.
const gPoster = guest
  .filter((q) => !(q.flags & 2))
  .slice(0, 1100)
  .map(({ p, flags }) => [Math.round(p[0] * 300 + 120), Math.round(600 - (p[1] / 1.85) * 580 - 10), flags & 1] as const);
const gBodyPath = gPoster.filter((d) => !d[2]).map(([x, y]) => `M${x} ${y}h0`).join("");
const gCasePath = gPoster.filter((d) => d[2]).map(([x, y]) => `M${x} ${y}h0`).join("");
writeFileSync(
  "src/components/story/guest-points.ts",
  `// Generated by scripts/generate-agent-points.ts — do not edit.\n` +
    `// Front view, 300 units per world unit; feet centre at (120, 590).\n` +
    `export const GUEST_VIEWBOX = "0 0 360 600";\n` +
    `export const GUEST_BODY = ${JSON.stringify(gBodyPath)};\n` +
    `export const GUEST_CASE = ${JSON.stringify(gCasePath)};\n`,
);
console.log(`guest points: ${guest.length}; guest poster dots: ${gPoster.length}`);
