/** Catmull-Rom → cubic Bézier path through points (smooth, passes through every point). */
export function smoothPath(pts: [number, number][], tension = 0.5): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * Illustrative guest-demand shape over 24 h (0..1): quiet night, check-out peak in the
 * morning, check-in peak late afternoon. Not measured data — labelled as such on the page.
 */
export const DEMAND_SHAPE = [
  0.06, 0.04, 0.03, 0.03, 0.03, 0.05, 0.12, 0.3, 0.55, 0.72, 0.66, 0.48, 0.3, 0.25, 0.36, 0.62, 0.78, 0.8,
  0.7, 0.56, 0.42, 0.3, 0.18, 0.1, 0.06,
];
