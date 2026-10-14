import { Color } from "three";

/** Kit colour tokens (src/styles/kit.css) read at runtime, so the stage never hard-codes hex values. */
export function readStageColors() {
  const css = getComputedStyle(document.documentElement);
  const color = (name: string) => new Color(css.getPropertyValue(name).trim() || "#808080");
  return {
    mist: color("--pitch-mist"),
    charcoal: color("--pitch-charcoal"),
    orbs: [color("--pitch-orb-blue"), color("--pitch-orb-aqua"), color("--pitch-orb-peach"), color("--pitch-orb-pink")] as const,
    pillFrom: color("--pitch-pill-from"),
    pillTo: color("--pitch-pill-to"),
  };
}

export type StageColors = ReturnType<typeof readStageColors>;
