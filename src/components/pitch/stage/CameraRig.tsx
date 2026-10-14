"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, Vector3, type PerspectiveCamera } from "three";
import { getPitch } from "../pitch-store";
import { sceneFor, type Shot } from "./scene-state";

const MOVE_RATE = 1.5; // camera moves settle in ~2 s
const PARALLAX = 0.12; // metres of drift with the mouse

/** Camera position and look-at for a shot at the current aspect ratio (focus `screenX` right of centre). */
function frame(shot: Shot, camera: PerspectiveCamera, eye: Vector3, look: Vector3) {
  const halfWidth = Math.tan(MathUtils.degToRad(camera.fov / 2)) * shot.distance * camera.aspect;
  const [fx, fy, fz] = shot.focus;
  look.set(fx - shot.screenX * halfWidth, fy, fz);
  eye.set(look.x, fy + 0.08, fz + shot.distance);
}

/** Eases the camera between chapter/step shots (never cuts), with gentle mouse parallax. */
export function CameraRig({ motion }: { motion: number }) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const rig = useRef({ eye: new Vector3(), look: new Vector3(), targetEye: new Vector3(), targetLook: new Vector3(), ready: false });

  useEffect(() => {
    const onVisibility = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [setFrameloop]);

  useFrame(({ camera, pointer }, dt) => {
    const r = rig.current;
    const { chapter, step } = getPitch();
    frame(sceneFor(chapter, step).shot, camera as PerspectiveCamera, r.targetEye, r.targetLook);
    if (!r.ready || motion === 0) {
      r.eye.copy(r.targetEye);
      r.look.copy(r.targetLook);
      r.ready = true;
    } else {
      const k = 1 - Math.exp(-MOVE_RATE * dt);
      r.eye.lerp(r.targetEye, k);
      r.look.lerp(r.targetLook, k);
    }
    camera.position.set(r.eye.x + pointer.x * PARALLAX * motion, r.eye.y + pointer.y * PARALLAX * 0.6 * motion, r.eye.z);
    camera.lookAt(r.look);
  });
  return null;
}
