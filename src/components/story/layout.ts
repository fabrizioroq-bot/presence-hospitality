/**
 * Shared lobby layout in world units (16 × 10, origin at the centre, y up).
 * Used by the WebGL scene, the SVG sketch and the DOM overlays so they line up exactly.
 */
export const WORLD = { w: 16, h: 10 } as const;
export const FLOOR = -3.6;

export const DOOR = { x0: 5.0, x1: 6.8, y1: 2.4 };
export const KIOSK = {
  screen: { x0: -4.8, x1: -2.4, y0: -1.5, y1: 0.8 },
  pole: { x0: -3.85, x1: -3.35, y1: -1.5 },
  base: { x0: -4.4, x1: -2.8, y1: -3.45 },
};
export const HOLOBOX = { x0: 0.3, x1: 2.7, y1: 2.8, plinth: -3.2, cap: 2.5, cx: 1.5 };
export const HUB = { from: [1.5, 2.8] as const, ctrl: [3.2, 4.9] as const, to: [8.4, 4.3] as const };

/** Body height is 1.75 in the point file; guests and agents are scaled to ~3.6 world units. */
export const PERSON_SCALE = 2.05;
export const GUEST_X = { door: 5.9, kiosk: -1.5, holobox: -0.55, exit: -1.9 };

/** World → CSS percentage inside the 16:10 stage. */
export const pctX = (x: number) => ((x + WORLD.w / 2) / WORLD.w) * 100;
export const pctY = (y: number) => ((WORLD.h / 2 - y) / WORLD.h) * 100;

/** Number of steps in the story; scroll progress s runs 0..STEPS. */
export const STEPS = 6;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Timeline: every scene value as a function of s (0..6). Shared by WebGL + SVG + DOM. */
export function timeline(s: number) {
  const envForm = smooth(0, 0.35, s);
  const guestIn = smooth(0.15, 0.4, s);
  // Guest walks door → kiosk (step 1), kiosk → holobox (step 4), holobox → exit (step 6).
  let guestX: number = GUEST_X.door;
  guestX += (GUEST_X.kiosk - GUEST_X.door) * smooth(0.3, 0.95, s);
  guestX += (GUEST_X.holobox - GUEST_X.kiosk) * smooth(3.0, 3.45, s);
  guestX += (GUEST_X.exit - GUEST_X.holobox) * smooth(5.2, 5.9, s);
  const walking =
    (s > 0.3 && s < 0.95) || (s > 3.0 && s < 3.45) || (s > 5.2 && s < 5.9) ? 1 : 0;
  // Leaving: the guest dissolves into rising light ("heads upstairs") before reaching the kiosk.
  const guestOut = smooth(5.3, 5.8, s);
  const typing = smooth(1.05, 1.8, s);
  const alert = smooth(2.1, 2.35, s) * (1 - smooth(5.0, 5.2, s));
  const flow = smooth(3.4, 3.7, s) * (1 - smooth(4.9, 5.3, s));
  const agent = smooth(4.0, 4.8, s);
  const done = smooth(5.05, 5.3, s);
  return { envForm, guestIn, guestX, walking, guestOut, typing, alert, flow, agent, done };
}
export type Timeline = ReturnType<typeof timeline>;
