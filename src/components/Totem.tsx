import { useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';
import { useScrollProgress } from '../store/scrollProgress';
import ContactForm from './ContactForm';

const TOTEM_Z = -9.5;
// "Voting machine" by jeremy (CC-BY, poly.pizza) — a podium-with-recessed-
// screen shape close enough to a check-in kiosk to reskin. See
// public/models/CREDITS.md for the attribution this license requires.
const TOTEM_SCALE = 0.21;
const SCREEN_LIGHT_START = 0.82;
const FORM_VISIBLE_FROM = 0.88;

interface TotemNodes {
  ['Voting_machine_Cube028-Mesh']: THREE.Mesh;
  ['Voting_machine_Cube028-Mesh_1']: THREE.Mesh;
  ['Voting_machine_Cube028-Mesh_2']: THREE.Mesh;
}
interface TotemMaterials {
  FFFFFF: THREE.MeshStandardMaterial;
  ['455A64']: THREE.MeshStandardMaterial;
  ['1A1A1A']: THREE.MeshStandardMaterial;
}
type TotemGLTF = GLTF & { nodes: TotemNodes; materials: TotemMaterials };

export default function Totem() {
  const { nodes, materials } = useGLTF('/models/totem.glb') as unknown as TotemGLTF;
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const formWrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    materials.FFFFFF.color.set('#262a42');
    materials.FFFFFF.roughness = 0.5;
    materials.FFFFFF.metalness = 0.15;
    materials['455A64'].color.set('#181a28');
    materials['455A64'].roughness = 0.6;
    materials['455A64'].metalness = 0.1;
    materials['1A1A1A'].color.set('#0d0e16');
    materials['1A1A1A'].roughness = 0.5;
  }, [materials]);

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
      {/* Kiosk body, scaled from the sourced model's local units */}
      <group scale={TOTEM_SCALE}>
        <mesh
          geometry={nodes['Voting_machine_Cube028-Mesh'].geometry}
          material={materials.FFFFFF}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={nodes['Voting_machine_Cube028-Mesh_1'].geometry}
          material={materials['455A64']}
          castShadow
          receiveShadow
        />
        <mesh geometry={nodes['Voting_machine_Cube028-Mesh_2'].geometry} material={materials['1A1A1A']} />
        {/* the model's own baked-in screen graphic (red/blue) is skipped —
            replaced below with our own scroll-reactive screen */}
      </group>

      {/* Everything below is in real-world units, aligned to the model's
          screen recess (computed from its local bounding box * scale).
          Screen is sized closer to the contact form's own aspect ratio,
          with a thin header bar as UI chrome so the space above the form
          reads as intentional framing, not dead padding. */}
      <mesh position={[0, 1.55, 0.33]}>
        <planeGeometry args={[0.62, 0.84]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#0f2f2a"
          emissive="#2dd4bf"
          emissiveIntensity={0.15}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 1.9, 0.335]}>
        <planeGeometry args={[0.62, 0.09]} />
        <meshStandardMaterial color="#123a34" emissive="#2dd4bf" emissiveIntensity={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.865, 0.336]}>
        <planeGeometry args={[0.62, 0.006]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.9} />
      </mesh>
      <Html center position={[0, 1.9, 0.34]} transform distanceFactor={0.45} occlude={false}>
        <div className="pointer-events-none select-none whitespace-nowrap font-display text-[11px] font-semibold uppercase tracking-[0.4em] text-headline">
          Presence
        </div>
      </Html>

      <pointLight position={[0, 1.55, 0.5]} intensity={0.8} color="#2dd4bf" distance={3} />

      {/* "Check in here" signage above the kiosk */}
      <Html center position={[0, 2.3, 0.1]} occlude distanceFactor={2.6} transform>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-full border border-teal/40 bg-black/50 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.3em] text-teal shadow-[0_0_20px_rgba(45,212,191,0.35)]">
          Check in here
        </div>
      </Html>

      <Html
        transform
        center
        position={[0, 1.42, 0.36]}
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

useGLTF.preload('/models/totem.glb');

export { TOTEM_Z };
