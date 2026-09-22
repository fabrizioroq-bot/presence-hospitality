import { Html, RoundedBox } from '@react-three/drei';
import { TOTEM_Z } from './Totem';

const DESK_POSITION: [number, number, number] = [1.45, 0, TOTEM_Z + 0.2];
const SIGNAGE_Z = TOTEM_Z - 0.55;

function DeskCounter() {
  return (
    <group position={DESK_POSITION}>
      <RoundedBox args={[1.7, 0.95, 0.55]} radius={0.05} position={[0, 0.475, 0]} castShadow>
        <meshStandardMaterial color="#1d2a34" roughness={0.5} metalness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.975, 0]}>
        <boxGeometry args={[1.72, 0.03, 0.57]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.7} />
      </mesh>
      {/* countertop lamp */}
      <mesh position={[0.6, 1.12, 0]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#3a3020" emissive="#ffcf9e" emissiveIntensity={2.2} />
      </mesh>
      <pointLight position={[0.6, 1.18, 0]} intensity={1.4} color="#ffcf9e" distance={3} decay={2} />
      {/* small welcome plant */}
      <mesh position={[-0.6, 1.08, 0]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#1f6f5c" roughness={0.8} />
      </mesh>
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
      <Html center position={[0, 2.15, 0.06]} occlude distanceFactor={6} transform>
        <div className="pointer-events-none select-none whitespace-nowrap font-display text-[11px] font-semibold uppercase tracking-[0.4em] text-headline">
          Presence Hospitality
        </div>
      </Html>
      <mesh position={[0, 1.7, 0.055]}>
        <planeGeometry args={[2.6, 0.03]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1} />
      </mesh>
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
      <Rug />
      <pointLight position={[0.5, 2.4, TOTEM_Z]} intensity={1.5} color="#ffe3c2" distance={6} decay={2} />
    </group>
  );
}
