"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";
import { tierConfig, type Tier } from "@/lib/perf-tier";
import { HeroScene, type PointerState } from "./hero-scene";

export type { PointerState };

type Props = {
  tier: Tier;
  portal: RefObject<HTMLElement | null>;
  pointer: RefObject<PointerState>;
  scroll: MotionValue<number>;
  active: boolean;
  onReady: () => void;
};

function SceneDriver({ tier, portal, pointer, scroll, active, onReady }: Props) {
  const scene = useRef<HeroScene | null>(null);
  const readySent = useRef(false);
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);

  useEffect(() => {
    const s = new HeroScene(tier, () => invalidate());
    scene.current = s;
    if (portal.current) s.measure(portal.current);
    return () => {
      s.dispose();
      scene.current = null;
    };
  }, [tier, portal, invalidate]);

  // Re-measure (radius) and, for reduced motion, re-render on resize.
  useEffect(() => {
    if (portal.current) scene.current?.measure(portal.current);
    invalidate();
  }, [size, portal, invalidate]);

  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);

  useFrame((state, delta) => {
    const s = scene.current;
    const el = portal.current;
    if (!s || !el) return;
    s.frame({
      gl: state.gl,
      width: state.size.width,
      height: state.size.height,
      time: state.clock.elapsedTime,
      delta,
      portal: el,
      pointer: pointer.current,
      scroll: scroll.get(),
      setDpr: state.setDpr,
    });
    if (!readySent.current && s.loaded) {
      readySent.current = true;
      onReady();
    }
  }, 1);

  return null;
}

export default function HeroCanvas(props: Props) {
  const cfg = tierConfig[props.tier];
  const frameloop = props.tier === "reduced" ? "demand" : props.active ? "always" : "never";
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      dpr={cfg.dpr}
      frameloop={frameloop}
      flat
      linear
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", premultipliedAlpha: true }}
    >
      <SceneDriver {...props} />
    </Canvas>
  );
}
