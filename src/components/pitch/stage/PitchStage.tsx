"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import { hasWebGL2 } from "@/lib/perf-tier";
import { useReducedMotion } from "@/lib/hooks";
import { Background } from "./Background";
import { Holobox } from "./Holobox";
import { readStageColors, type StageColors } from "./tokens";

const PARALLAX = 0.22; // camera drift with the mouse, in world units

/** Pauses rendering while the tab is hidden; gentle mouse parallax on the camera. */
function CameraRig({ motion }: { motion: number }) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    const onVisibility = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [setFrameloop]);
  useFrame(({ camera, pointer }, dt) => {
    const k = 1 - Math.exp(-2 * dt);
    camera.position.x += (pointer.x * PARALLAX * motion - camera.position.x) * k;
    camera.position.y += (pointer.y * PARALLAX * 0.6 * motion - camera.position.y) * k;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/**
 * The single, persistent WebGL canvas behind all chapters (loaded lazily by PitchShell). Scene state
 * comes from the pitch store, so chapters never remount it. Without WebGL2: a static CSS backdrop.
 */
export default function PitchStage() {
  const reduced = useReducedMotion();
  const [canRender] = useState(hasWebGL2);
  const [colors] = useState<StageColors>(readStageColors);
  const [isReady, setIsReady] = useState(false);
  const motion = reduced ? 0 : 1;

  if (!canRender) return <div aria-hidden className="pitch-fallback absolute inset-0" />;
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="pitch-fallback absolute inset-0" />
      <Canvas
        className={cx("absolute! inset-0 transition-opacity duration-(--dur-slow)", isReady ? "opacity-100" : "opacity-0")}
        dpr={[1, 1.5]}
        camera={{ fov: 30, position: [0, 0, 12], near: 0.1, far: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={() => requestAnimationFrame(() => setIsReady(true))}
      >
        <hemisphereLight args={[colors.pillTo, colors.charcoal, 1.1]} />
        <directionalLight position={[-4, 5, 8]} intensity={1.6} />
        <Background colors={colors} motion={motion} />
        <Holobox colors={colors} motion={motion} />
        <CameraRig motion={motion} />
      </Canvas>
    </div>
  );
}
