"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Readable } from "@/lib/anim";
import { useEffect, useRef } from "react";
import { StoryScene } from "./story-scene";

function Driver({ s, onReady }: { s: Readable; onReady: () => void }) {
  const scene = useRef<StoryScene | null>(null);
  const ready = useRef(false);
  const invalidate = useThree((st) => st.invalidate);

  useEffect(() => {
    const sc = new StoryScene(() => {
      invalidate();
      if (!ready.current) {
        ready.current = true;
        onReady();
      }
    });
    scene.current = sc;
    return () => {
      sc.dispose();
      scene.current = null;
    };
  }, [invalidate, onReady]);

  useFrame((state) => {
    scene.current?.frame({ gl: state.gl, time: state.clock.elapsedTime, s: s.get() });
  }, 1);
  return null;
}

export default function StoryCanvas({
  s,
  active,
  onReady,
}: {
  s: Readable;
  active: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      flat
      linear
      orthographic
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <Driver s={s} onReady={onReady} />
    </Canvas>
  );
}
