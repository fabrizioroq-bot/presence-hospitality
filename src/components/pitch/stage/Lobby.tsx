"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, IUniform, Mesh, MeshStandardMaterial } from "three";
import { getPitch } from "../pitch-store";
import { beat, setOpacity } from "./fade";
import { approach, sceneFor, type Vec3 } from "./scene-state";
import { kioskScreenFragment, planeVertex, wallFragment } from "./shaders";
import type { StageColors } from "./tokens";

const ENTER_RATE = 2.4;
const WALL = { w: 9.5, h: 3.4, z: -0.7, panel: 1.2 };
const KIOSK_X = [-1.5, 1.5] as const;
const HEAD_TILT = -0.2;
/** Seconds after the kiosk step starts: matches the checklist delays in chapters/HowItWorks.tsx. */
const BEATS = { payment: 2.0, key: 2.7 };

/** World points the DOM anchors to (stage/Anchors.tsx): the left kiosk's screen centre. */
export const LOBBY_ANCHORS: Record<string, Vec3> = { "kiosk-screen": [KIOSK_X[0], 1.43, -0.03] };

function Kiosk({ x, colors, screenUniforms, children }: { x: number; colors: StageColors; screenUniforms: Record<string, IUniform>; children?: React.ReactNode }) {
  const body = colors.mist.clone().lerp(colors.charcoal, 0.28);
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.525, 0]}>
        <boxGeometry args={[0.42, 1.05, 0.32]} />
        <meshPhysicalMaterial color={body} roughness={0.4} clearcoat={0.5} transparent />
      </mesh>
      <group position={[0, 1.08, 0]} rotation={[HEAD_TILT, 0, 0]}>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.5, 0.7, 0.07]} />
          <meshStandardMaterial color={colors.charcoal} roughness={0.4} metalness={0.3} transparent />
        </mesh>
        <mesh position={[0, 0.35, 0.037]}>
          <planeGeometry args={[0.44, 0.62]} />
          <shaderMaterial vertexShader={planeVertex} fragmentShader={kioskScreenFragment} uniforms={screenUniforms} transparent />
        </mesh>
      </group>
      {children}
    </group>
  );
}

/** "How it works": the lobby wall, two kiosks with payment terminal and key encoder, a key drop. */
export function Lobby({ colors, motion }: { colors: StageColors; motion: number }) {
  const wall = useRef<Group>(null);
  const kiosks = useRef<Group>(null);
  const kioskLeft = useRef<Group>(null);
  const led = useRef<MeshStandardMaterial>(null);
  const card = useRef<Mesh>(null);
  const state = useRef({ wall: 0, kiosks: 0, kioskLeft: 0, clock: { key: "", start: 0 } });

  const wallUniforms = useMemo(
    () => ({
      uColor: { value: colors.mist.clone().lerp(colors.pillTo, 0.55) },
      uSeam: { value: colors.mist.clone().multiplyScalar(0.82) },
      uOpacity: { value: 0 },
      uPanels: { value: WALL.w / WALL.panel },
    }),
    [colors],
  );
  const screenLeft = useMemo(() => ({ uBg: { value: colors.pillTo }, uHeader: { value: colors.pillFrom }, uOpacity: { value: 0 } }), [colors]);
  const screenRight = useMemo(() => ({ uBg: { value: colors.pillTo }, uHeader: { value: colors.pillFrom }, uOpacity: { value: 0 } }), [colors]);
  const device = useMemo(() => colors.charcoal.clone().multiplyScalar(0.8), [colors]);

  useFrame(({ clock }, dt) => {
    if (!wall.current || !kiosks.current || !kioskLeft.current || !led.current || !card.current) return;
    const s = state.current;
    const { chapter, step } = getPitch();
    const target = sceneFor(chapter, step);
    const instant = motion === 0;
    s.wall = instant ? target.wall : approach(s.wall, target.wall, ENTER_RATE, dt);
    s.kiosks = instant ? target.kiosks : approach(s.kiosks, target.kiosks, ENTER_RATE, dt);
    setOpacity(wall.current, s.wall);
    s.kioskLeft = instant ? target.kioskLeft : approach(s.kioskLeft, target.kioskLeft, ENTER_RATE, dt);
    setOpacity(kiosks.current, s.kiosks);
    setOpacity(kioskLeft.current, Math.min(s.kiosks, s.kioskLeft));
    kiosks.current.position.y = (1 - s.kiosks) * -0.2;

    // Kiosk story (first build of "how it works"): payment LED pulses, then the key card slides out.
    const t = beat(s.clock, `${chapter}:${step}`, clock.elapsedTime);
    const onKioskStep = target.kiosks > 0 && step === 0;
    const paid = instant || !onKioskStep ? 0 : Math.max(0, 1 - Math.abs(t - BEATS.payment - 0.3) / 0.4);
    led.current.emissiveIntensity = 0.2 + paid * 3;
    const out = !onKioskStep ? 0 : instant ? 1 : Math.min(1, Math.max(0, (t - BEATS.key) / 0.5));
    card.current.position.z = 0.06 + out * 0.07;
    card.current.visible = out > 0;
  });

  return (
    <>
      <group ref={wall} visible={false}>
        <mesh position={[0, WALL.h / 2, WALL.z]}>
          <planeGeometry args={[WALL.w, WALL.h]} />
          <shaderMaterial vertexShader={planeVertex} fragmentShader={wallFragment} uniforms={wallUniforms} transparent depthWrite={false} />
        </mesh>
      </group>
      <group ref={kiosks} visible={false}>
        <group ref={kioskLeft}>
        <Kiosk x={KIOSK_X[0]} colors={colors} screenUniforms={screenLeft}>
          {/* payment terminal on a side shelf */}
          <mesh position={[0.31, 0.93, 0.05]}>
            <boxGeometry args={[0.2, 0.02, 0.18]} />
            <meshStandardMaterial color={device} transparent />
          </mesh>
          <mesh position={[0.31, 1.02, 0.05]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[0.1, 0.17, 0.05]} />
            <meshStandardMaterial color={device} roughness={0.5} transparent />
          </mesh>
          <mesh position={[0.31, 1.07, 0.08]} rotation={[-0.35, 0, 0]}>
            <sphereGeometry args={[0.008, 12, 12]} />
            <meshStandardMaterial ref={led} color={colors.pillFrom} emissive={colors.pillFrom} emissiveIntensity={0.2} transparent />
          </mesh>
          {/* key encoder with the card that slides out */}
          <mesh position={[-0.31, 0.93, 0.05]}>
            <boxGeometry args={[0.2, 0.02, 0.18]} />
            <meshStandardMaterial color={device} transparent />
          </mesh>
          <mesh position={[-0.31, 0.97, 0.03]}>
            <boxGeometry args={[0.15, 0.06, 0.11]} />
            <meshStandardMaterial color={device} roughness={0.5} transparent />
          </mesh>
          <mesh ref={card} position={[-0.31, 0.975, 0.06]} visible={false}>
            <boxGeometry args={[0.086, 0.003, 0.054]} />
            <meshStandardMaterial color={colors.pillTo} transparent />
          </mesh>
        </Kiosk>
        </group>
        <Kiosk x={KIOSK_X[1]} colors={colors} screenUniforms={screenRight} />
        {/* key drop on the wall */}
        <mesh position={[2.6, 1.05, WALL.z + 0.05]}>
          <boxGeometry args={[0.32, 0.42, 0.08]} />
          <meshStandardMaterial color={colors.mist.clone().lerp(colors.charcoal, 0.4)} roughness={0.5} metalness={0.3} transparent />
        </mesh>
        <mesh position={[2.6, 1.12, WALL.z + 0.091]}>
          <boxGeometry args={[0.2, 0.012, 0.004]} />
          <meshStandardMaterial color={colors.charcoal.clone().multiplyScalar(0.4)} transparent />
        </mesh>
      </group>
    </>
  );
}
