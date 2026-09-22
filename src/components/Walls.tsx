import { PaintingModel } from './Models';

const WALL_X = 4.2;
const WALL_HEIGHT = 4;
const Z_FROM = 10;
const Z_TO = -12;
const WALL_LENGTH = Z_FROM - Z_TO;
const WALL_CENTER_Z = (Z_FROM + Z_TO) / 2;

function WallPanel({ side }: { side: 1 | -1 }) {
  const x = WALL_X * side;
  return (
    <group>
      <mesh position={[x, WALL_HEIGHT / 2, WALL_CENTER_Z]} receiveShadow>
        <boxGeometry args={[0.12, WALL_HEIGHT, WALL_LENGTH]} />
        <meshStandardMaterial color="#232537" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* glowing accent trim, roughly at handrail height */}
      <mesh position={[x - side * 0.07, 1.15, WALL_CENTER_Z]}>
        <boxGeometry args={[0.02, 0.05, WALL_LENGTH]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={0.6} />
      </mesh>
      {/* baseboard */}
      <mesh position={[x - side * 0.07, 0.12, WALL_CENTER_Z]}>
        <boxGeometry args={[0.02, 0.24, WALL_LENGTH]} />
        <meshStandardMaterial color="#14151f" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Ceiling() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_HEIGHT, WALL_CENTER_Z]}>
      <planeGeometry args={[WALL_X * 2, WALL_LENGTH]} />
      <meshStandardMaterial color="#181a28" roughness={0.9} />
    </mesh>
  );
}

type PaintingVariant = 'a' | 'b' | 'c';

interface PaintingSpec {
  z: number;
  side: 1 | -1;
  variant: PaintingVariant;
}

// Real framed canvas art ("Wall Art 03/05/06" by Jarlan Perez, CC-BY) —
// actual printed pieces with a frame and mat, not glowing primitives.
// z: -0.2, side: -1 intentionally omitted — that's where the lobby
// dashboard panel is wall-mounted (see LobbyProps.tsx), and the two
// were overlapping.
const PAINTINGS: PaintingSpec[] = [
  { z: 6.2, side: -1, variant: 'a' },
  { z: 5.4, side: 1, variant: 'b' },
  { z: 2.6, side: 1, variant: 'c' },
  { z: -2.4, side: 1, variant: 'a' },
  { z: -4.6, side: -1, variant: 'c' },
];

function Painting({ z, side, variant, lit }: PaintingSpec & { lit: boolean }) {
  const x = WALL_X * side - side * 0.1;
  const rotY = (side > 0 ? -Math.PI / 2 : Math.PI / 2) + Math.PI;
  return (
    <group position={[x, 1.85, z]} rotation={[0, rotY, 0]}>
      <PaintingModel variant={variant} scale={1.7} />
      {/* soft warm picture light, like a real gallery fixture — not an
          accent-colored glow baked into the art itself */}
      <pointLight
        position={[0, 0.5, 0.7]}
        intensity={lit ? 1.6 : 0.9}
        color="#fff1de"
        distance={2.6}
        decay={2}
      />
    </group>
  );
}

const PENDANT_Z = [4.4, 1, -2.4, -5.4];

function PendantLight({ z }: { z: number }) {
  const bulbY = WALL_HEIGHT - 1.3;
  const cordLength = WALL_HEIGHT - bulbY;
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, (WALL_HEIGHT + bulbY) / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, cordLength, 6]} />
        <meshStandardMaterial color="#2a2c3a" />
      </mesh>
      <mesh position={[0, bulbY, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#3a3020" emissive="#ffcf9e" emissiveIntensity={1.6} />
      </mesh>
      <pointLight position={[0, bulbY - 0.1, 0]} intensity={3.2} color="#ffcf9e" distance={6.5} decay={2} />
    </group>
  );
}

export default function Walls() {
  return (
    <group>
      <WallPanel side={1} />
      <WallPanel side={-1} />
      <Ceiling />
      {PAINTINGS.map((p, i) => (
        <Painting key={i} {...p} lit={i % 2 === 0} />
      ))}
      {PENDANT_Z.map((z) => (
        <PendantLight key={z} z={z} />
      ))}
    </group>
  );
}
