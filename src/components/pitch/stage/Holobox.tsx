"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, Color, NormalBlending, type Group, type MeshStandardMaterial, type ShaderMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { getPitch } from "../pitch-store";
import { approach, sceneFor } from "./scene-state";
import { planeVertex, poolFragment, screenFragment } from "./shaders";
import type { StageColors } from "./tokens";

const BOX = { w: 1.3, h: 3.2, d: 0.32 };
const SCREEN = { w: 1.12, h: 2.72 };
const ENTER_RATE = 2.4; // fade/slide in over ~1 s
const POWER_SECONDS = 1.8; // scan → flicker → glow
const POWER_DELAY = 0.35; // the screen starts once the box is mostly in
const FLOOR_TILT = -1.2; // floor planes lean towards the camera so they read as light, not a line

/** The Holobox: a dark cabinet that slides in, then its screen powers on (cover chapter). */
export function Holobox({ colors, motion }: { colors: StageColors; motion: number }) {
  const group = useRef<Group>(null);
  const screen = useRef<ShaderMaterial>(null);
  const glow = useRef<ShaderMaterial>(null);
  const shadow = useRef<ShaderMaterial>(null);
  const cabinet = useRef<MeshStandardMaterial>(null);
  const viewport = useThree((s) => s.viewport);
  const state = useRef({ visible: 0, power: 0 });

  const geometry = useMemo(() => new RoundedBoxGeometry(BOX.w, BOX.h, BOX.d, 4, 0.09), []);
  const cabinetColor = useMemo(() => colors.charcoal.clone().multiplyScalar(0.8), [colors]);
  // The geometry is passed as an object, so R3F won't dispose it: do it on unmount.
  useEffect(() => () => geometry.dispose(), [geometry]);

  const screenUniforms = useMemo(
    () => ({
      uPower: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uTop: { value: colors.pillTo },
      uBottom: { value: colors.pillFrom },
      uDark: { value: new Color(colors.charcoal).multiplyScalar(0.25) },
    }),
    [colors],
  );
  const glowUniforms = useMemo(() => ({ uColor: { value: colors.pillFrom }, uStrength: { value: 0 } }), [colors]);
  const shadowUniforms = useMemo(() => ({ uColor: { value: colors.charcoal }, uStrength: { value: 0 } }), [colors]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g || !screen.current || !glow.current || !shadow.current || !cabinet.current) return;
    const s = state.current;
    const target = sceneFor(getPitch().chapter).holobox;
    const instant = motion === 0;
    s.visible = instant ? target : approach(s.visible, target, ENTER_RATE, dt);
    // The screen powers on once the box is in; it powers down instantly when the box leaves.
    if (target > 0 && s.visible > 1 - POWER_DELAY) s.power = instant ? 1 : Math.min(1, s.power + dt / POWER_SECONDS);
    else if (target === 0) s.power = 0;

    // Right third of the frame, scaled to the viewport height.
    const scale = Math.min(1.15, viewport.height / 6.2);
    g.scale.setScalar(scale);
    g.position.set(viewport.width * 0.27 + (1 - s.visible) * 1.4, -0.2 * scale, 0);
    g.visible = s.visible > 0.01;
    cabinet.current.opacity = s.visible;
    screen.current.uniforms.uOpacity.value = s.visible;
    screen.current.uniforms.uPower.value = s.power;
    screen.current.uniforms.uTime.value += dt;
    glow.current.uniforms.uStrength.value = s.visible * 0.55 * Math.max(0, (s.power - 0.5) * 2);
    shadow.current.uniforms.uStrength.value = s.visible * 0.28;
  });

  return (
    <group ref={group} visible={false}>
      <mesh geometry={geometry}>
        <meshStandardMaterial ref={cabinet} color={cabinetColor} roughness={0.38} metalness={0.45} transparent opacity={0} />
      </mesh>
      <mesh position={[0, 0, BOX.d / 2 + 0.003]}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <shaderMaterial ref={screen} vertexShader={planeVertex} fragmentShader={screenFragment} uniforms={screenUniforms} transparent />
      </mesh>
      <mesh position={[0, -BOX.h / 2 - 0.02, 0.2]} rotation={[FLOOR_TILT, 0, 0]}>
        <planeGeometry args={[2.4, 0.9]} />
        <shaderMaterial ref={shadow} vertexShader={planeVertex} fragmentShader={poolFragment} uniforms={shadowUniforms} transparent depthWrite={false} blending={NormalBlending} />
      </mesh>
      <mesh position={[0, -BOX.h / 2 - 0.01, 0.35]} rotation={[FLOOR_TILT, 0, 0]}>
        <planeGeometry args={[3.4, 1.4]} />
        <shaderMaterial ref={glow} vertexShader={planeVertex} fragmentShader={poolFragment} uniforms={glowUniforms} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>
    </group>
  );
}
