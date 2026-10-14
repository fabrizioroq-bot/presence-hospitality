import type { Material, Mesh, Object3D, ShaderMaterial } from "three";

/**
 * Fades every material under `root` (opacity, or the `uOpacity` uniform of shader materials) and
 * hides the group when it is fully out. Materials must be created with `transparent`.
 */
export function setOpacity(root: Object3D, value: number) {
  root.visible = value > 0.005;
  if (!root.visible) return;
  root.traverse((o) => {
    const material = (o as Mesh).material as Material | Material[] | undefined;
    if (!material) return;
    for (const m of Array.isArray(material) ? material : [material]) {
      const uniforms = (m as ShaderMaterial).uniforms;
      if (uniforms?.uOpacity) uniforms.uOpacity.value = value;
      else if (!uniforms) m.opacity = value;
    }
  });
}

/** Seconds since the presenter last moved (chapter/step `key` changed): drives timed story beats. */
export function beat(clock: { key: string; start: number }, key: string, now: number) {
  if (clock.key !== key) {
    clock.key = key;
    clock.start = now;
  }
  return now - clock.start;
}
