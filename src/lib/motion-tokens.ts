/**
 * Motion tokens for JS (springs, timelines, WebGL). Mirror of the motion block in src/styles/kit.css;
 * change both together. Durations in milliseconds, easings as cubic-bezier control points.
 */
export const DURATION = {
  instant: 120,
  fast: 200,
  base: 450,
  slow: 700,
  scene: 900,
  stagger: 70,
} as const;

export type Bezier = readonly [number, number, number, number];

export const EASING = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.7, 0, 0.84, 0],
} as const satisfies Record<string, Bezier>;

/** Spring presets for `spring()` in src/lib/anim.ts. */
export const SPRING = {
  /** UI elements settling (pills, numbers, cards). */
  ui: { stiffness: 170, damping: 26, mass: 1 },
  /** Camera and large 3D moves: slow, no overshoot (same values as the hero parallax). */
  camera: { stiffness: 40, damping: 18, mass: 1 },
} as const;
