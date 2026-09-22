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

interface PaintingSpec {
  z: number;
  side: 1 | -1;
  tone: string;
}

const PAINTINGS: PaintingSpec[] = [
  { z: 6.2, side: -1, tone: '#d8a857' },
  { z: 5.4, side: 1, tone: '#2dd4bf' },
  { z: 2.6, side: 1, tone: '#a855f7' },
  { z: -0.2, side: -1, tone: '#2dd4bf' },
  { z: -2.4, side: 1, tone: '#d8a857' },
  { z: -4.6, side: -1, tone: '#a855f7' },
];

function Painting({ z, side, tone, lit }: PaintingSpec & { lit: boolean }) {
  const x = WALL_X * side - side * 0.13;
  const rotY = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return (
    <group position={[x, 1.85, z]} rotation={[0, rotY, 0]}>
      <mesh>
        <boxGeometry args={[0.9, 1.2, 0.04]} />
        <meshStandardMaterial color="#0d0e16" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[0.76, 1.02]} />
        <meshStandardMaterial
          color={tone}
          emissive={tone}
          emissiveIntensity={lit ? 0.45 : 0.65}
          roughness={0.6}
        />
      </mesh>
      {lit && <pointLight position={[0, 0.75, 0.4]} intensity={0.7} color={tone} distance={2.4} decay={2} />}
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
