"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, Color, NormalBlending, type Group, type ShaderMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { getPitch } from "../pitch-store";
import { Agent } from "./Agent";
import { HOLOBOX_CLIP } from "./clip";
import { beat, setOpacity } from "./fade";
import { approach, sceneFor } from "./scene-state";
import { planeVertex, poolFragment, screenFragment } from "./shaders";
import type { StageColors } from "./tokens";

// Real proportions (metres): a 2.2 m booth on a 6 cm plinth, screen inset in a lighter bezel.
const PLINTH = 0.06;
const BODY = { w: 0.9, h: 2.15, d: 0.5 };
const FRONT = BODY.d / 2;
const SCREEN = { w: 0.76, h: 1.72, y: 0.2 + 1.72 / 2 };
const STRIP = { h: 0.15, y: PLINTH + BODY.h - 0.11 };
const ENTER_RATE = 2.4; // fade/rise in over ~1 s
const POWER_SECONDS = 1.8; // scan → flicker → glow
const RIPPLE_SECONDS = 1.6; // one Call ripple
const HALO = { light: 0.14, dark: 0.34 };

const pool = (color: Color, aspect: number) => ({
  uColor: { value: color },
  uStrength: { value: 0.28 },
  uOpacity: { value: 0 },
  uAspect: { value: aspect },
});

/** The Holobox, shared by the cover, the before/after comparison and the lobby. */
export function Holobox({ colors, motion }: { colors: StageColors; motion: number }) {
  const group = useRef<Group>(null);
  const screen = useRef<ShaderMaterial>(null);
  const glow = useRef<ShaderMaterial>(null);
  const halo = useRef<ShaderMaterial>(null);
  const state = useRef({ visible: 0, power: 0, stage: 0, halo: HALO.light, clock: { key: "", start: 0 } });

  const bodyGeometry = useMemo(() => new RoundedBoxGeometry(BODY.w, BODY.h, BODY.d, 4, 0.035), []);
  useEffect(() => () => bodyGeometry.dispose(), [bodyGeometry]); // passed as an object: not auto-disposed

  const palette = useMemo(
    () => ({
      body: colors.charcoal.clone(),
      plinth: colors.charcoal.clone().multiplyScalar(0.55),
      bezel: colors.charcoal.clone().lerp(colors.mist, 0.38),
      strip: colors.charcoal.clone().lerp(colors.mist, 0.22),
    }),
    [colors],
  );
  const screenUniforms = useMemo(
    () => ({
      uPower: { value: 0 },
      uStage: { value: 0 },
      uRipple: { value: -1 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uTop: { value: colors.pillTo },
      uBottom: { value: colors.pillFrom },
      uDark: { value: new Color(colors.charcoal).multiplyScalar(0.22) },
    }),
    [colors],
  );
  const shadowUniforms = useMemo(() => pool(colors.charcoal, 1.6), [colors]);
  const glowUniforms = useMemo(() => pool(colors.pillFrom, 1.6), [colors]);
  const haloUniforms = useMemo(() => pool(colors.pillFrom, 0.75), [colors]);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g || !screen.current || !glow.current || !halo.current) return;
    const s = state.current;
    const { chapter, step } = getPitch();
    const target = sceneFor(chapter, step);
    const instant = motion === 0;
    s.visible = instant ? target.holobox : approach(s.visible, target.holobox, ENTER_RATE, dt);
    if (target.holobox > 0 && s.visible > 0.65) s.power = instant ? 1 : Math.min(1, s.power + dt / POWER_SECONDS);
    else if (target.holobox === 0) s.power = 0;
    s.stage = instant ? target.screenStage : approach(s.stage, target.screenStage, 2.5, dt);
    s.halo = approach(s.halo, target.tone > 0.5 ? HALO.dark : HALO.light, 3, dt);
    const sinceMove = beat(s.clock, `${chapter}:${step}`, clock.elapsedTime);

    g.position.y = (1 - s.visible) * -0.25;
    setOpacity(g, s.visible);
    const u = screen.current.uniforms;
    u.uPower.value = s.power;
    u.uStage.value = s.stage;
    u.uTime.value += dt;
    u.uRipple.value = target.call > 0 && !instant ? (sinceMove / RIPPLE_SECONDS) % 1 : -1;
    glow.current.uniforms.uStrength.value = 0.5 * Math.max(0, (s.power - 0.5) * 2) * (1 - 0.6 * s.stage);
    halo.current.uniforms.uStrength.value = s.halo;
  });

  return (
    <group ref={group} visible={false}>
      <mesh position={[0, -0.005, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 1.1]} />
        <shaderMaterial vertexShader={planeVertex} fragmentShader={poolFragment} uniforms={shadowUniforms} transparent depthWrite={false} blending={NormalBlending} />
      </mesh>
      <mesh position={[0, 0, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 1.5]} />
        <shaderMaterial ref={glow} vertexShader={planeVertex} fragmentShader={poolFragment} uniforms={glowUniforms} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh position={[0, 1.2, -0.45]}>
        <planeGeometry args={[2.6, 3.4]} />
        <shaderMaterial ref={halo} vertexShader={planeVertex} fragmentShader={poolFragment} uniforms={haloUniforms} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>

      <mesh position={[0, PLINTH / 2, 0]}>
        <boxGeometry args={[BODY.w + 0.06, PLINTH, BODY.d + 0.04]} />
        <meshStandardMaterial color={palette.plinth} roughness={0.6} transparent clippingPlanes={HOLOBOX_CLIP} />
      </mesh>
      <mesh geometry={bodyGeometry} position={[0, PLINTH + BODY.h / 2, 0]}>
        <meshPhysicalMaterial
          color={palette.body}
          roughness={0.34}
          metalness={0.15}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          transparent
          clippingPlanes={HOLOBOX_CLIP}
        />
      </mesh>
      <mesh position={[0, STRIP.y, FRONT + 0.004]}>
        <boxGeometry args={[BODY.w - 0.1, STRIP.h, 0.01]} />
        <meshStandardMaterial color={palette.strip} roughness={0.45} metalness={0.3} transparent clippingPlanes={HOLOBOX_CLIP} />
      </mesh>
      <mesh position={[0, STRIP.y, FRONT + 0.011]}>
        <boxGeometry args={[0.46, 0.012, 0.004]} />
        <meshStandardMaterial color={colors.pillFrom} emissive={colors.pillFrom} emissiveIntensity={1.6} transparent clippingPlanes={HOLOBOX_CLIP} />
      </mesh>
      <mesh position={[0, SCREEN.y, FRONT + 0.003]}>
        <planeGeometry args={[SCREEN.w + 0.04, SCREEN.h + 0.04]} />
        <meshStandardMaterial color={palette.bezel} roughness={0.5} metalness={0.4} transparent clippingPlanes={HOLOBOX_CLIP} />
      </mesh>
      <mesh position={[0, SCREEN.y, FRONT + 0.005]}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <shaderMaterial
          ref={screen}
          vertexShader={planeVertex}
          fragmentShader={screenFragment}
          uniforms={screenUniforms}
          transparent
          clipping
          clippingPlanes={HOLOBOX_CLIP}
        />
      </mesh>
      <Agent motion={motion} />
    </group>
  );
}
