import { Html, Sparkles } from '@react-three/drei';

const DOORWAY_Z = 7;
const DOORWAY_WIDTH = 3;
const DOORWAY_HEIGHT = 3.2;

export default function Entrance() {
  return (
    <group position={[0, 0, DOORWAY_Z]}>
      {/* Doorway frame — left post, right post, lintel */}
      <mesh position={[-DOORWAY_WIDTH / 2, DOORWAY_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.15, DOORWAY_HEIGHT, 0.3]} />
        <meshStandardMaterial color="#2b2d45" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[DOORWAY_WIDTH / 2, DOORWAY_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.15, DOORWAY_HEIGHT, 0.3]} />
        <meshStandardMaterial color="#2b2d45" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, DOORWAY_HEIGHT, 0]}>
        <boxGeometry args={[DOORWAY_WIDTH + 0.3, 0.2, 0.3]} />
        <meshStandardMaterial
          color="#2dd4bf"
          emissive="#2dd4bf"
          emissiveIntensity={0.6}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      <Html center position={[0, DOORWAY_HEIGHT + 0.7, 0]} occlude distanceFactor={8} transform>
        <div className="pointer-events-none select-none whitespace-nowrap font-display text-[10px] font-semibold uppercase tracking-[0.5em] text-headline">
          Presence Hospitality
        </div>
      </Html>

      <Sparkles
        count={60}
        scale={[DOORWAY_WIDTH + 1, DOORWAY_HEIGHT + 1, 2]}
        position={[0, DOORWAY_HEIGHT / 2, 0]}
        size={2}
        speed={0.15}
        opacity={0.5}
        color="#a5b4fc"
      />
    </group>
  );
}
