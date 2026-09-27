"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Readable } from "@/lib/anim";
import { useEffect, useRef, type RefObject } from "react";
import { tierConfig, type Tier } from "@/lib/perf-tier";
import { HeroScene, type PointerState, type SceneVariant } from "./hero-scene";

export type { PointerState };

type Props = {
  tier: Tier;
  portal: RefObject<HTMLElement | null>;
  pointer: RefObject<PointerState>;
  scroll: Readable;
  active: boolean;
  onReady: () => void;
  variant?: SceneVariant;
  /** Drag-to-rotate yaw in radians (stage). */
  yaw?: RefObject<number>;
  /** Increment to make the agent re-form from the beam. */
  reformKey?: number;
  /** Asked when the point cloud has loaded: true = appear fully formed (the poster is on screen, so swap without re-forming). */
  formed?: () => boolean;
};

function SceneDriver({ tier, portal, pointer, scroll, active, onReady, variant = "hero", yaw, reformKey = 0, formed }: Props) {
  const scene = useRef<HeroScene | null>(null);
  const readySent = useRef(false);
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);

  useEffect(() => {
    // The hero agent greets once per visit (tab session); the stage agent greets when it first forms.
    let autoGreet = true;
    if (variant === "hero") {
      try {
        autoGreet = !sessionStorage.getItem("ph-greeted");
      } catch {}
    }
    const onGreet = () => {
      try {
        if (variant === "hero") sessionStorage.setItem("ph-greeted", "1");
      } catch {}
    };
    const s = new HeroScene(tier, () => invalidate(), variant, autoGreet, onGreet, formed ?? false);
    scene.current = s;
    if (portal.current) s.measure(portal.current);
    return () => {
      s.dispose();
      scene.current = null;
    };
    // `formed` only matters when the scene is created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, portal, invalidate, variant]);

  useEffect(() => {
    if (reformKey > 0) {
      scene.current?.reform();
      invalidate();
    }
  }, [reformKey, invalidate]);

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
      yaw: yaw?.current ?? 0,
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
