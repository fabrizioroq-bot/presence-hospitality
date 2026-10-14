import { CHAPTERS, type ChapterId } from "../chapters";

/**
 * What the WebGL stage shows per chapter and build step. The stage eases towards these targets every
 * frame, so the camera and objects never cut. World units are metres: floor at y = 0, the Holobox at
 * the origin, the lobby wall behind it. Orb positions are in screen UV (0..1, y up).
 */
export type Vec3 = readonly [number, number, number];
export type OrbLayout = readonly [x: number, y: number, radius: number];

/** Frame `focus` from `distance` m, with the focus placed `screenX` of the half-width right of centre. */
export type Shot = { focus: Vec3; distance: number; screenX: number };

export type SceneTarget = {
  /** 0 = light (mist), 1 = dark (charcoal). */
  tone: number;
  /** Blue, aqua, peach, pink: kept away from each chapter's text column. */
  orbs: readonly [OrbLayout, OrbLayout, OrbLayout, OrbLayout];
  shot: Shot;
  /** 0..1 visibility of each group. */
  holobox: number;
  desk: number;
  wall: number;
  kiosks: number;
  /** The check-in kiosk (left of the Holobox): steps back once its part of the story is told. */
  kioskLeft: number;
  /** Holobox screen: 0 = glowing idle screen, 1 = dark interior (a receptionist is on). */
  screenStage: number;
  /** 1 while the receptionist is formed in the Holobox. */
  agent: number;
  /** 1 while the Call button ripples. */
  call: number;
  /** The before/after split follows the comparison slider (Our solution). */
  compare: boolean;
};

const HIDDEN = { holobox: 0, desk: 0, wall: 0, kiosks: 0, kioskLeft: 0, screenStage: 0, agent: 0, call: 0, compare: false } as const;
const COVER_SHOT: Shot = { focus: [0, 1.12, 0], distance: 6.4, screenX: 0.5 };

const BASE: Record<ChapterId, SceneTarget> = {
  cover: { ...HIDDEN, tone: 0, holobox: 1, shot: COVER_SHOT, orbs: [[0.74, 0.56, 0.42], [0.97, 0.92, 0.22], [0.86, 0.08, 0.2], [0.04, 0.98, 0.16]] },
  problem: { ...HIDDEN, tone: 1, shot: COVER_SHOT, orbs: [[0.85, 0.75, 0.4], [0.15, 0.1, 0.25], [0.6, 0.0, 0.2], [0.95, 0.2, 0.18]] },
  solution: {
    ...HIDDEN,
    tone: 0,
    holobox: 1,
    desk: 1,
    wall: 1,
    compare: true,
    shot: { focus: [0, 1.05, 0], distance: 6.3, screenX: 0.46 },
    orbs: [[0.2, 0.85, 0.35], [0.9, 0.2, 0.3], [0.6, 0.05, 0.18], [0.95, 0.95, 0.18]],
  },
  how: {
    ...HIDDEN,
    tone: 0,
    holobox: 1,
    wall: 1,
    kiosks: 1,
    kioskLeft: 1,
    shot: { focus: [-1.5, 1.25, 0], distance: 3.3, screenX: 0.34 },
    orbs: [[0.5, 0.95, 0.4], [0.05, 0.3, 0.25], [0.95, 0.15, 0.2], [0.7, 0.6, 0.15]],
  },
  behind: { ...HIDDEN, tone: 0, shot: COVER_SHOT, orbs: [[0.9, 0.5, 0.38], [0.1, 0.9, 0.22], [0.3, 0.05, 0.2], [0.6, 0.98, 0.16]] },
  packages: { ...HIDDEN, tone: 1, shot: COVER_SHOT, orbs: [[0.15, 0.8, 0.36], [0.9, 0.85, 0.25], [0.8, 0.1, 0.22], [0.4, 0.05, 0.16]] },
  pricing: { ...HIDDEN, tone: 0, shot: COVER_SHOT, orbs: [[0.85, 0.3, 0.36], [0.2, 0.95, 0.22], [0.05, 0.1, 0.2], [0.98, 0.95, 0.16]] },
  close: { ...HIDDEN, tone: 0, shot: COVER_SHOT, orbs: [[0.5, 0.5, 0.45], [0.75, 0.85, 0.24], [0.3, 0.15, 0.22], [0.85, 0.15, 0.18]] },
};

/** Per-step changes on top of a chapter's base (camera moves and story beats). */
const STEPS: Partial<Record<ChapterId, Partial<SceneTarget>[]>> = {
  // 1 traditional desk · 2 with Presence (slider) · 3 pillars: the 3D steps back behind the card band.
  solution: [{}, {}, { holobox: 0, desk: 0, wall: 0, compare: false }],
  // 1 check in at the kiosk · 2 one tap on Call · 3 a real receptionist appears, life-size.
  how: [
    {},
    { shot: { focus: [0, 1.05, 0], distance: 5.1, screenX: 0.44 }, call: 1, kioskLeft: 0 },
    { shot: { focus: [0, 1.1, 0], distance: 5.6, screenX: 0.45 }, agent: 1, screenStage: 1, kioskLeft: 0 },
  ],
};

export function sceneFor(chapter: number, step = 0): SceneTarget {
  const id = CHAPTERS[chapter].id;
  return { ...BASE[id], ...STEPS[id]?.[step] };
}

/** Frame-rate independent exponential approach: `rate` ≈ 1/seconds to cover ~63% of the gap. */
export const approach = (value: number, target: number, rate: number, dt: number) =>
  value + (target - value) * (1 - Math.exp(-rate * dt));
