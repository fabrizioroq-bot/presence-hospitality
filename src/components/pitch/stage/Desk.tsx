"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, type Group, type Mesh, type MeshBasicMaterial, type MeshStandardMaterial, type PointLight } from "three";
import { getComparison } from "../comparison-store";
import { getPitch } from "../pitch-store";
import { DESK_CLIP, setSplit, splitX } from "./clip";
import { setOpacity } from "./fade";
import { approach, sceneFor } from "./scene-state";
import type { StageColors } from "./tokens";

const ENTER_RATE = 2.4;
const CLOCK = { y: 2.25, z: -0.66, r: 0.19 };
const TAU = Math.PI * 2;

/**
 * "Traditional front desk" (Our solution): an empty counter at 3 AM — an empty chair, a warm lamp and
 * a wall clock whose second hand ticks. It shares the Holobox's spot; the slider's split wipes between
 * the two (clip.ts), with a thin light seam on the split.
 */
export function Desk({ colors, motion }: { colors: StageColors; motion: number }) {
  const group = useRef<Group>(null);
  const seam = useRef<Mesh>(null);
  const second = useRef<Group>(null);
  const lamp = useRef<PointLight>(null);
  const shade = useRef<MeshStandardMaterial>(null);
  const visible = useRef(0);

  const palette = useMemo(
    () => ({
      wood: colors.orbs[2].clone().lerp(colors.charcoal, 0.55),
      top: colors.mist.clone().lerp(colors.pillTo, 0.5),
      dark: colors.charcoal.clone(),
      face: colors.pillTo.clone(),
      warm: colors.orbs[2].clone(),
    }),
    [colors],
  );

  useFrame((_, dt) => {
    const g = group.current;
    if (!g || !seam.current || !second.current || !lamp.current || !shade.current) return;
    const { chapter, step } = getPitch();
    const target = sceneFor(chapter, step);
    visible.current = motion === 0 ? target.desk : approach(visible.current, target.desk, ENTER_RATE, dt);
    setOpacity(g, visible.current);

    const c = getComparison();
    const split = target.compare ? splitX(c) : null;
    setSplit(split);
    const seamMat = seam.current.material as MeshBasicMaterial;
    seam.current.visible = split !== null && c > 0.01 && c < 0.99;
    seam.current.position.x = split ?? 0;
    seamMat.opacity = visible.current * 0.9;

    // The traditional side is warm and lamp-lit; it fades as the split moves across.
    const warmth = visible.current * (1 - c);
    lamp.current.intensity = warmth * 2.4;
    shade.current.emissiveIntensity = 0.3 + warmth * 1.6;
    second.current.rotation.z = -((Math.floor(Date.now() / 1000) % 60) / 60) * TAU;
  });

  const clip = { transparent: true, clippingPlanes: DESK_CLIP };
  return (
    <>
      <group ref={group} visible={false}>
        {/* counter */}
        <mesh position={[0, 0.51, 0]}>
          <boxGeometry args={[1.7, 1.02, 0.6]} />
          <meshStandardMaterial color={palette.wood} roughness={0.7} {...clip} />
        </mesh>
        <mesh position={[0, 1.04, 0.02]}>
          <boxGeometry args={[1.78, 0.04, 0.68]} />
          <meshStandardMaterial color={palette.top} roughness={0.35} {...clip} />
        </mesh>
        {/* empty chair behind the desk */}
        <mesh position={[0.18, 0.47, -0.55]}>
          <boxGeometry args={[0.46, 0.06, 0.44]} />
          <meshStandardMaterial color={palette.dark} roughness={0.6} {...clip} />
        </mesh>
        <mesh position={[0.18, 0.86, -0.77]}>
          <boxGeometry args={[0.46, 0.62, 0.05]} />
          <meshStandardMaterial color={palette.dark} roughness={0.6} {...clip} />
        </mesh>
        {/* desk lamp */}
        <mesh position={[-0.55, 1.07, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 24]} />
          <meshStandardMaterial color={palette.dark} roughness={0.4} metalness={0.5} {...clip} />
        </mesh>
        <mesh position={[-0.55, 1.26, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.38, 8]} />
          <meshStandardMaterial color={palette.dark} roughness={0.4} metalness={0.5} {...clip} />
        </mesh>
        <mesh position={[-0.55, 1.47, 0]}>
          <cylinderGeometry args={[0.05, 0.12, 0.14, 24, 1, true]} />
          <meshStandardMaterial ref={shade} color={palette.warm} emissive={palette.warm} emissiveIntensity={1.6} side={2} {...clip} />
        </mesh>
        <pointLight ref={lamp} position={[-0.55, 1.38, 0.15]} color={palette.warm} distance={3} decay={2} intensity={0} />
        {/* wall clock at 3:00 */}
        <group position={[0, CLOCK.y, CLOCK.z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[CLOCK.r, CLOCK.r, 0.03, 48]} />
            <meshStandardMaterial color={palette.face} roughness={0.5} {...clip} />
          </mesh>
          <mesh position={[0.05, 0, 0.02]}>
            <boxGeometry args={[0.1, 0.018, 0.006]} />
            <meshStandardMaterial color={palette.dark} {...clip} />
          </mesh>
          <mesh position={[0, 0.07, 0.022]}>
            <boxGeometry args={[0.012, 0.14, 0.006]} />
            <meshStandardMaterial color={palette.dark} {...clip} />
          </mesh>
          <group ref={second} position={[0, 0, 0.026]}>
            <mesh position={[0, 0.075, 0]}>
              <boxGeometry args={[0.005, 0.15, 0.004]} />
              <meshStandardMaterial color={palette.warm} {...clip} />
            </mesh>
          </group>
        </group>
      </group>
      <mesh ref={seam} position={[0, 1.25, 0.45]} visible={false}>
        <planeGeometry args={[0.012, 2.6]} />
        <meshBasicMaterial color={colors.pillTo} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  );
}
