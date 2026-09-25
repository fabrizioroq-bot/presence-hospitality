export type Tier = "high" | "mid" | "low" | "reduced";

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

/** Picks a rendering tier from device hints. Runs client-side only. */
export function detectTier(): Tier {
  if (typeof window === "undefined") return "low";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced";
  const nav = navigator as NavigatorWithMemory;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 8;
  if ((coarse && (mem <= 4 || cores <= 4)) || window.innerWidth < 768) return "low";
  if (coarse || cores <= 6) return "mid";
  return "high";
}

export const tierConfig = {
  high: { points: 60000, file: "agent-60k.bin", field: 900, bokeh: 12, octaves: 4, dpr: [1, 1.5] as [number, number], size: 2.2 },
  mid: { points: 30000, file: "agent-60k.bin", field: 600, bokeh: 8, octaves: 3, dpr: [1, 1.25] as [number, number], size: 2.5 },
  low: { points: 12000, file: "agent-12k.bin", field: 260, bokeh: 5, octaves: 2, dpr: [1, 1] as [number, number], size: 2.9 },
  reduced: { points: 12000, file: "agent-12k.bin", field: 260, bokeh: 5, octaves: 2, dpr: [1, 1] as [number, number], size: 2.9 },
} satisfies Record<Tier, unknown>;

export function hasWebGL2(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}
