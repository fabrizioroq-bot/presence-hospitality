import { ContactShadows, Html } from '@react-three/drei';
import { DeskModel, ReceptionistModel } from './Models';
import { TOTEM_Z } from './Totem';

const DESK_POSITION: [number, number, number] = [1.45, 0, TOTEM_Z + 0.2];
const SIGNAGE_Z = TOTEM_Z - 0.55;
const DESK_SCALE = 2.32;

function DeskCounter() {
  return (
    <group position={DESK_POSITION}>
      {/* sourced desk model, offset so its (off-center) bounding box lands
          centered at this group's origin */}
      <DeskModel scale={DESK_SCALE} position={[0.828, 0, -0.427]} castShadow receiveShadow />

      {/* guest-facing modesty panel — the sourced desk is open-legged like
          a home-office desk, this closes the front like a real reception
          counter, on the side that faces arriving guests */}
      <mesh position={[0, 0.4, 0.42]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#1d2a34" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.82, 0.42]}>
        <boxGeometry args={[1.62, 0.03, 0.07]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.7} />
      </mesh>

      {/* countertop lamp */}
      <mesh position={[0.6, 1.0, 0]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#3a3020" emissive="#ffcf9e" emissiveIntensity={2.2} />
      </mesh>
      <pointLight position={[0.6, 1.05, 0]} intensity={1.4} color="#ffcf9e" distance={3} decay={2} />
      {/* small welcome plant */}
      <mesh position={[-0.6, 0.96, 0]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#1f6f5c" roughness={0.8} />
      </mesh>
    </group>
  );
}

function KeySlots() {
  const cols = 4;
  const rows = 3;
  const cell = 0.15;
  const gap = 0.035;
  return (
    <group position={[-1.15, 1.55, 0.065]}>
      {Array.from({ length: rows }).flatMap((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <mesh
            key={`${r}-${c}`}
            position={[(c - (cols - 1) / 2) * (cell + gap), (r - (rows - 1) / 2) * (cell + gap), 0]}
          >
            <boxGeometry args={[cell, cell, 0.05]} />
            <meshStandardMaterial color="#0d0e16" roughness={0.5} metalness={0.4} />
          </mesh>
        )),
      )}
    </group>
  );
}

function SignageWall() {
  return (
    <group position={[0, 0, SIGNAGE_Z]}>
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[3.4, 2.6, 0.1]} />
        <meshStandardMaterial color="#161826" roughness={0.7} />
      </mesh>
      <Html center position={[0.05, 2.2, 0.06]} occlude distanceFactor={3.4} transform>
        <div className="pointer-events-none flex select-none flex-col items-center whitespace-nowrap">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.4em] text-headline">
            Presence Hospitality
          </span>
          <span className="mt-1 font-mono text-[7px] uppercase tracking-[0.35em] text-teal/70">
            A pilot for RB Horeca
          </span>
        </div>
      </Html>
      <mesh position={[0.05, 1.7, 0.055]}>
        <planeGeometry args={[2.2, 0.03]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} />
      </mesh>
      <KeySlots />
      <pointLight position={[0, 2.6, 0.8]} intensity={2.2} color="#ffffff" distance={5} decay={2} />
    </group>
  );
}

function Rug() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.6, 0.012, TOTEM_Z + 0.5]}>
      <planeGeometry args={[3.4, 2.6]} />
      <meshStandardMaterial color="#12241f" roughness={1} />
    </mesh>
  );
}

export default function Reception() {
  return (
    <group>
      <SignageWall />
      <DeskCounter />
      <ReceptionistModel position={[1.45, 0, TOTEM_Z - 0.42]} />
      <Rug />
      <ContactShadows position={[0.7, 0.015, TOTEM_Z]} width={4.5} height={3.5} blur={1.6} opacity={0.5} far={2} />
      <pointLight position={[0.5, 2.4, TOTEM_Z]} intensity={1.5} color="#ffe3c2" distance={6} decay={2} />
    </group>
  );
}
