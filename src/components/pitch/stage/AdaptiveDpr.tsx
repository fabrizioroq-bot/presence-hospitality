"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

const MAX_DPR = 1.5; // matches the Canvas dpr cap
const MIN_DPR = 1;
const STEP = 0.25;
const WINDOW = 90; // frames per measurement (~1.5 s)
const SLOW_MS = 19; // average frame above this (< ~52 fps): drop resolution
const FAST_MS = 13; // average frame below this for a while: allow resolution back up
const COOLDOWN_S = 2;

/**
 * Keeps the stage smooth on weak GPUs (e.g. an integrated chip driving a 4K TV): if frames get slow
 * the canvas renders at a lower pixel ratio (never below 1); with headroom it creeps back up.
 */
export function AdaptiveDpr() {
  const setDpr = useThree((s) => s.setDpr);
  const state = useRef({ frames: 0, total: 0, fastWindows: 0, cooldown: 0, dpr: 0 });

  useFrame(({ gl }, dt) => {
    const s = state.current;
    if (!s.dpr) s.dpr = Math.min(MAX_DPR, gl.getPixelRatio());
    s.cooldown = Math.max(0, s.cooldown - dt);
    // Ignore long pauses (tab switches, chapter loads): they are not rendering cost.
    if (dt > 0.25) return;
    s.frames++;
    s.total += dt * 1000;
    if (s.frames < WINDOW) return;
    const avg = s.total / s.frames;
    s.frames = 0;
    s.total = 0;
    if (s.cooldown > 0) return;
    if (avg > SLOW_MS && s.dpr > MIN_DPR) {
      s.dpr = Math.max(MIN_DPR, s.dpr - STEP);
      s.fastWindows = 0;
      s.cooldown = COOLDOWN_S;
      setDpr(s.dpr);
    } else if (avg < FAST_MS && s.dpr < Math.min(MAX_DPR, window.devicePixelRatio)) {
      if (++s.fastWindows >= 4) {
        s.dpr = Math.min(MAX_DPR, s.dpr + STEP);
        s.fastWindows = 0;
        s.cooldown = COOLDOWN_S;
        setDpr(s.dpr);
      }
    } else s.fastWindows = 0;
  });
  return null;
}
