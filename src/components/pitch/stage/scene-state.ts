import { CHAPTERS, type ChapterId } from "../chapters";

/**
 * What the WebGL stage shows per chapter. The stage eases towards these targets every frame, so the
 * camera and objects never cut between chapters. Orb positions are in screen UV (0..1, y up).
 */
export type OrbLayout = readonly [x: number, y: number, radius: number];
export type SceneTarget = {
  /** 0 = light (mist), 1 = dark (charcoal). */
  tone: number;
  /** Blue, aqua, peach, pink — kept away from each chapter's text column. */
  orbs: readonly [OrbLayout, OrbLayout, OrbLayout, OrbLayout];
  /** 0..1 visibility of the Holobox. */
  holobox: number;
};

const SCENES: Record<ChapterId, SceneTarget> = {
  cover: { tone: 0, holobox: 1, orbs: [[0.74, 0.56, 0.42], [0.97, 0.92, 0.22], [0.86, 0.08, 0.2], [0.04, 0.98, 0.16]] },
  problem: { tone: 1, holobox: 0, orbs: [[0.85, 0.75, 0.4], [0.15, 0.1, 0.25], [0.6, 0.0, 0.2], [0.95, 0.2, 0.18]] },
  solution: { tone: 0, holobox: 0, orbs: [[0.2, 0.85, 0.35], [0.9, 0.2, 0.3], [0.6, 0.05, 0.18], [0.95, 0.95, 0.18]] },
  how: { tone: 0, holobox: 0, orbs: [[0.5, 0.95, 0.4], [0.05, 0.3, 0.25], [0.95, 0.15, 0.2], [0.7, 0.6, 0.15]] },
  behind: { tone: 0, holobox: 0, orbs: [[0.9, 0.5, 0.38], [0.1, 0.9, 0.22], [0.3, 0.05, 0.2], [0.6, 0.98, 0.16]] },
  packages: { tone: 1, holobox: 0, orbs: [[0.15, 0.8, 0.36], [0.9, 0.85, 0.25], [0.8, 0.1, 0.22], [0.4, 0.05, 0.16]] },
  pricing: { tone: 0, holobox: 0, orbs: [[0.85, 0.3, 0.36], [0.2, 0.95, 0.22], [0.05, 0.1, 0.2], [0.98, 0.95, 0.16]] },
  close: { tone: 0, holobox: 0, orbs: [[0.5, 0.5, 0.45], [0.75, 0.85, 0.24], [0.3, 0.15, 0.22], [0.85, 0.15, 0.18]] },
};

export const sceneFor = (chapter: number): SceneTarget => SCENES[CHAPTERS[chapter].id];

/** Frame-rate independent exponential approach: `rate` ≈ 1/seconds to cover ~63% of the gap. */
export const approach = (value: number, target: number, rate: number, dt: number) =>
  value + (target - value) * (1 - Math.exp(-rate * dt));
