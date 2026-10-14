"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Vector2, Vector3, type ShaderMaterial } from "three";
import { getPitch } from "../pitch-store";
import { approach, sceneFor } from "./scene-state";
import { fullscreenVertex, orbsFragment } from "./shaders";
import type { StageColors } from "./tokens";

const ORB_RATE = 0.9; // orbs glide to each chapter's layout over ~2 s
const TONE_RATE = 3.2; // the light/dark dissolve takes ~0.9 s

/** Full-screen orb field behind every chapter (drawn first, no depth). */
export function Background({ colors, motion }: { colors: StageColors; motion: number }) {
  const material = useRef<ShaderMaterial>(null);
  const size = useThree((s) => s.size);
  const uniforms = useMemo(() => {
    const first = sceneFor(getPitch().chapter);
    return {
      uRes: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uMotion: { value: motion },
      uTone: { value: first.tone },
      uOrb: { value: first.orbs.map(([x, y, r]) => new Vector3(x, y, r)) },
      uCol: { value: colors.orbs.map((c) => c.clone()) },
      uMist: { value: colors.mist },
      uCharcoal: { value: colors.charcoal },
    };
    // Created once; per-frame updates write into these objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, dt) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const target = sceneFor(getPitch().chapter);
    const instant = motion === 0;
    u.uRes.value.set(size.width, size.height);
    u.uTime.value += dt;
    u.uTone.value = instant ? target.tone : approach(u.uTone.value, target.tone, TONE_RATE, dt);
    (u.uOrb.value as Vector3[]).forEach((v, i) => {
      const [x, y, r] = target.orbs[i];
      v.set(
        instant ? x : approach(v.x, x, ORB_RATE, dt),
        instant ? y : approach(v.y, y, ORB_RATE, dt),
        instant ? r : approach(v.z, r, ORB_RATE, dt),
      );
    });
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={fullscreenVertex}
        fragmentShader={orbsFragment}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
