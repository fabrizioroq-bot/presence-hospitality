import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollProgress } from '../store/scrollProgress';
import ContactForm from './ContactForm';

const TOTEM_Z = -9.5;
const SCREEN_LIGHT_START = 0.82;
const FORM_VISIBLE_FROM = 0.88;

export default function Totem() {
  const screenRef = useRef<THREE.Mesh>(null);
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const formWrapRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const progress = useScrollProgress.getState().progress;
    const t = THREE.MathUtils.clamp(
      (progress - SCREEN_LIGHT_START) / (1 - SCREEN_LIGHT_START),
      0,
      1,
    );
    if (screenMatRef.current) {
      screenMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(0.12, 0.85, t);
    }
  });

  useEffect(() => {
    const unsub = useScrollProgress.subscribe((state) => {
      const el = formWrapRef.current;
      if (!el) return;
      const t = THREE.MathUtils.clamp(
        (state.progress - FORM_VISIBLE_FROM) / (1 - FORM_VISIBLE_FROM),
        0,
        1,
      );
      el.style.opacity = String(t);
      el.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
    });
    return unsub;
  }, []);

  return (
    <group position={[0, 0, TOTEM_Z]}>
      {/* Base */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.38, 1, 20]} />
        <meshStandardMaterial color="#282b45" metalness={0.35} roughness={0.3} />
      </mesh>

      {/* Bezel behind the screen */}
      <mesh position={[0, 1.55, -0.02]}>
        <boxGeometry args={[0.75, 1.15, 0.08]} />
        <meshStandardMaterial color="#1d1f30" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Screen */}
      <mesh ref={screenRef} position={[0, 1.55, 0.03]}>
        <planeGeometry args={[0.66, 1.02]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#0f2f2a"
          emissive="#2dd4bf"
          emissiveIntensity={0.15}
          roughness={0.35}
        />
      </mesh>

      <pointLight position={[0, 1.55, 0.6]} intensity={0.8} color="#2dd4bf" distance={3} />

      <Html
        transform
        center
        position={[0, 1.55, 0.07]}
        distanceFactor={0.45}
        occlude={false}
        style={{ pointerEvents: 'none' }}
      >
        <div
          ref={formWrapRef}
          className="w-[280px] rounded-xl border border-teal/25 bg-panel/85 p-4 opacity-0 backdrop-blur-sm transition-opacity duration-300"
          style={{ pointerEvents: 'none' }}
        >
          <ContactForm />
        </div>
      </Html>
    </group>
  );
}

export { TOTEM_Z };
