"use client";

import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { cx } from "@/lib/cx";
import { hasWebGL2 } from "@/lib/perf-tier";
import { useReducedMotion } from "@/lib/hooks";
import { AdaptiveDpr } from "./AdaptiveDpr";
import { Anchors } from "./Anchors";
import { Background } from "./Background";
import { CameraRig } from "./CameraRig";
import { Desk } from "./Desk";
import { applyEnvironment } from "./environment";
import { Holobox } from "./Holobox";
import { LOBBY_ANCHORS, Lobby } from "./Lobby";
import { readStageColors, type StageColors } from "./tokens";

/**
 * The single, persistent WebGL canvas behind all chapters (loaded lazily by PitchShell). Scene state
 * comes from the pitch store, so chapters never remount it. World units are metres. Without WebGL2:
 * a static CSS backdrop.
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
        camera={{ fov: 30, position: [0, 1.2, 6.4], near: 0.1, far: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance", localClippingEnabled: true }}
        onCreated={({ gl, scene }) => {
          gl.localClippingEnabled = true; // the before/after split (stage/clip.ts)
          applyEnvironment(gl, scene);
          requestAnimationFrame(() => setIsReady(true));
        }}
      >
        <hemisphereLight args={[colors.pillTo, colors.charcoal, 0.8]} />
        <directionalLight position={[-3, 4, 5]} intensity={1.3} />
        {/* cool rim light from behind: separates the dark cabinet from charcoal chapters */}
        <directionalLight position={[3, 2.5, -4]} intensity={2} color={colors.pillTo} />
        <directionalLight position={[-3.5, 2, -3]} intensity={1.1} />
        <Background colors={colors} motion={motion} />
        <Holobox colors={colors} motion={motion} />
        <Desk colors={colors} motion={motion} />
        <Lobby colors={colors} motion={motion} />
        <Anchors points={LOBBY_ANCHORS} />
        <CameraRig motion={motion} />
        <AdaptiveDpr />
      </Canvas>
    </div>
  );
}
