import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { useScrollProgress } from '../store/scrollProgress';

// Waypoints for the walkthrough: entrance -> lobby -> corridor -> totem.
// Camera travels in -Z, with mild lateral drift for a "walking" feel.
// The curve stops ~0.9 world units short of the totem itself (see Totem.tsx's
// TOTEM_Z) so the kiosk and its screen stay in frame at the end of the scroll.
const WAYPOINTS: [number, number, number][] = [
  [0, 1.6, 9], // entrance
  [0, 1.6, 5], // entering lobby
  [1.1, 1.6, 1], // lobby
  [-1.1, 1.55, -3], // corridor start
  [-0.3, 1.5, -7.2], // corridor end / approach
  [0, 1.45, -8.6], // stop in front of the totem
];

const cameraCurve = new THREE.CatmullRomCurve3(
  WAYPOINTS.map((p) => new THREE.Vector3(...p)),
  false,
  'catmullrom',
  0.5,
);

// Metric (world-unit) lookahead distance along the curve's tangent, rather
// than a curve-parameter offset — keeps looking forward correctly even at
// t=1, where a parametric offset would collapse look-at onto the camera.
const LOOKAHEAD_DISTANCE = 1.6;

export default function CameraRig() {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const tangent = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3());

  useLayoutEffect(() => {
    const start = cameraCurve.getPointAt(0);
    camera.position.copy(start);
    const startTangent = cameraCurve.getTangentAt(0);
    const lookStart = start.clone().addScaledVector(startTangent, LOOKAHEAD_DISTANCE);
    currentLook.current.copy(lookStart);
    camera.lookAt(lookStart);
  }, [camera]);

  useFrame((_, delta) => {
    const progress = useScrollProgress.getState().progress;
    const t = THREE.MathUtils.clamp(progress, 0, 1);

    cameraCurve.getPointAt(t, targetPos.current);
    cameraCurve.getTangentAt(t, tangent.current);
    targetLook.current
      .copy(targetPos.current)
      .addScaledVector(tangent.current, LOOKAHEAD_DISTANCE);

    // Frame-rate independent lerp for smooth, non-jittery easing.
    const smoothing = 1 - Math.pow(0.0001, delta);
    camera.position.lerp(targetPos.current, smoothing);
    currentLook.current.lerp(targetLook.current, smoothing);
    camera.lookAt(currentLook.current);
  });

  return null;
}
