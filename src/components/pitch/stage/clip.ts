import { Plane, Vector3 } from "three";

/**
 * The before/after split of "Our solution": the traditional desk keeps x ≤ split, the Holobox keeps
 * x ≥ split, both at the same spot, so dragging the slider wipes one into the other. Outside that
 * chapter the planes keep everything (±100 m).
 */
export const DESK_CLIP = [new Plane(new Vector3(-1, 0, 0), 100)];
export const HOLOBOX_CLIP = [new Plane(new Vector3(1, 0, 0), 100)];

/** Split position in metres for a slider value (0 traditional → 1 with Presence). */
export const splitX = (comparison: number) => 1.05 - comparison * 2.1;

export function setSplit(x: number | null) {
  DESK_CLIP[0].constant = x === null ? 100 : x;
  HOLOBOX_CLIP[0].constant = x === null ? 100 : -x;
}
