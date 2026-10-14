"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdditiveBlending, Vector3, type BufferGeometry, type Points, type ShaderMaterial } from "three";
import { loadAgentGeometry } from "@/components/hologram/agent-geometry";
import { agentVertex } from "@/components/hologram/shaders";
import { detectTier, tierConfig } from "@/lib/perf-tier";
import { CHAPTERS } from "../chapters";
import { getPitch } from "../pitch-store";
import { sceneFor } from "./scene-state";
import { agentPointFragment } from "./shaders";

const FORMATION_S = 2.4;
const SWEEP_S = 3.2; // scan band through the figure, bottom to top
const POINT_SIZE = 3.2;
const GREET_S = 1.6; // nod + tilt + glow
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
/** The point file (up to 480 KB) downloads once the presenter reaches the chapter before "How it works". */
const LOAD_FROM = CHAPTERS.findIndex((c) => c.id === "how") - 1;

/**
 * The receptionist as the site's faceless point-cloud figure (1.9 m model), formed from the emitter
 * when the story calls for it; it nods on the closing "thank you". Rendered by Receptionist.tsx inside
 * the Holobox group (a real call clip replaces it once footage exists).
 */
export function Agent({ motion }: { motion: number }) {
  const material = useRef<ShaderMaterial>(null);
  const points = useRef<Points>(null);
  const dpr = useThree((s) => s.viewport.dpr);
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  const progress = useRef(0);
  const greet = useRef(0);
  const requested = useRef(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!shouldLoad) return;
    const cfg = tierConfig[detectTier()];
    let alive = true;
    let loaded: BufferGeometry | null = null;
    loadAgentGeometry(`/hologram/${cfg.file}`, cfg.points)
      .then((g) => {
        loaded = g;
        if (alive) setGeometry(g);
        else g.dispose();
      })
      .catch((err: unknown) => console.warn("Receptionist points unavailable:", err));
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, [shouldLoad]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uSize: { value: POINT_SIZE },
      uPR: { value: dpr },
      uFlicker: { value: 1 },
      uGlitchY: { value: -10 },
      uGlitchAmt: { value: 0 },
      uSweep: { value: -10 },
      uPointer: { value: new Vector3() },
      uPointerOn: { value: 0 },
      uMotion: { value: motion },
      uDissolve: { value: 0 },
      uNod: { value: 0 },
      uTilt: { value: 0 },
      uGreet: { value: 0 },
    }),
    // Created once; updated per frame below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, dt) => {
    const { chapter, step } = getPitch();
    if (!requested.current && chapter >= LOAD_FROM) {
      requested.current = true;
      setShouldLoad(true);
    }
    const u = material.current?.uniforms;
    if (!u) return;
    const target = sceneFor(chapter, step);
    const on = target.agent > 0;
    progress.current = on ? (motion === 0 ? 1 : Math.min(1, progress.current + dt / FORMATION_S)) : 0;
    u.uProgress.value = easeOutExpo(progress.current);
    // At progress 0 the shader still draws the points bunched at the emitter: hide them until forming.
    if (points.current) points.current.visible = progress.current > 0;
    u.uTime.value += dt;
    u.uPR.value = dpr;
    u.uSweep.value = motion === 0 ? -10 : ((u.uTime.value / SWEEP_S) % 1) * 2.4 - 0.2;
    // Greeting: once formed, a small nod with a friendly tilt and a glow (sin pulse, then rest).
    greet.current = target.greet > 0 && progress.current >= 1 && motion > 0 ? Math.min(1, greet.current + dt / GREET_S) : 0;
    const pulse = greet.current > 0 && greet.current < 1 ? Math.sin(Math.PI * greet.current) : 0;
    u.uNod.value = 0.32 * pulse;
    u.uTilt.value = 0.08 * pulse;
    u.uGreet.value = pulse;
  });

  if (!geometry) return null;
  return (
    <points ref={points} visible={false} geometry={geometry} position={[0, 0.2, 0.3]} scale={0.92} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={agentVertex}
        fragmentShader={agentPointFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
