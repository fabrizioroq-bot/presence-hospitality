"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";
import type { Vec3 } from "./scene-state";

/**
 * Pins DOM elements to points in the scene: each `[data-anchor="name"]` in the active chapter is moved
 * (transform only) to where `points[name]` projects. The text stays real, accessible HTML.
 */
export function Anchors({ points }: { points: Record<string, Vec3> }) {
  const v = useRef(new Vector3());
  useFrame(({ camera, size }) => {
    const els = document.querySelectorAll<HTMLElement>('.pitch-chapter[data-state="active"] [data-anchor]');
    els.forEach((el) => {
      const p = points[el.dataset.anchor ?? ""];
      if (!p) return;
      v.current.set(p[0], p[1], p[2]).project(camera);
      const x = (v.current.x * 0.5 + 0.5) * size.width;
      const y = (-v.current.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    });
  });
  return null;
}
