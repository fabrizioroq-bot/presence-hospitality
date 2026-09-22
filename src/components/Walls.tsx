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

type PaintingStyle = 'horizon' | 'orbit' | 'stripes';

interface PaintingSpec {
  z: number;
  side: 1 | -1;
  style: PaintingStyle;
  bg: string;
  accent: string;
}

const PAINTINGS: PaintingSpec[] = [
  { z: 6.2, side: -1, style: 'horizon', bg: '#241a10', accent: '#d8a857' },
  { z: 5.4, side: 1, style: 'orbit', bg: '#0e2320', accent: '#2dd4bf' },
  { z: 2.6, side: 1, style: 'stripes', bg: '#1c1330', accent: '#a855f7' },
  { z: -0.2, side: -1, style: 'orbit', bg: '#101c2e', accent: '#2dd4bf' },
  { z: -2.4, side: 1, style: 'horizon', bg: '#231a12', accent: '#d8a857' },
  { z: -4.6, side: -1, style: 'stripes', bg: '#1a1024', accent: '#a855f7' },
];

// Small compositions built from primitives, so each "painting" reads as an
// actual piece of art rather than a flat swatch of color.
function PaintingArt({ style, bg, accent }: { style: PaintingStyle; bg: string; accent: string }) {
  return (
    <group>
      <mesh>
        <planeGeometry args={[0.76, 1.02]} />
        <meshStandardMaterial color={bg} roughness={0.75} />
      </mesh>

      {style === 'horizon' && (
        <>
          <mesh position={[0, -0.22, 0.004]}>
            <planeGeometry args={[0.76, 0.55]} />
            <meshStandardMaterial color={bg} emissive={accent} emissiveIntensity={0.08} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.055, 0.005]}>
            <planeGeometry args={[0.76, 0.012]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0.13, 0.3, 0.005]}>
            <circleGeometry args={[0.16, 28]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
          </mesh>
        </>
      )}

      {style === 'orbit' && (
        <>
          <mesh position={[0, 0, 0.005]} rotation={[0, 0, Math.PI / 8]}>
            <ringGeometry args={[0.22, 0.245, 48]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} side={2} />
          </mesh>
          <mesh position={[0, 0, 0.006]} rotation={[0, 0, -Math.PI / 6]}>
            <ringGeometry args={[0.33, 0.345, 48]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.55}
              side={2}
              transparent
              opacity={0.85}
            />
          </mesh>
          <mesh position={[0, 0, 0.007]}>
            <circleGeometry args={[0.07, 24]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.1} />
          </mesh>
        </>
      )}

      {style === 'stripes' &&
        [-0.2, -0.02, 0.2].map((offset, i) => (
          <mesh key={i} position={[offset, 0, 0.004 + i * 0.001]} rotation={[0, 0, Math.PI / 5]}>
            <planeGeometry args={[0.05, 1.1]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.5 + i * 0.12}
              transparent
              opacity={0.85}
            />
          </mesh>
        ))}
    </group>
  );
}

function Painting({ z, side, style, bg, accent, lit }: PaintingSpec & { lit: boolean }) {
  const x = WALL_X * side - side * 0.13;
  const rotY = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return (
    <group position={[x, 1.85, z]} rotation={[0, rotY, 0]}>
      <mesh>
        <boxGeometry args={[0.9, 1.2, 0.04]} />
        <meshStandardMaterial color="#0d0e16" metalness={0.5} roughness={0.4} />
      </mesh>
      <group position={[0, 0, 0.025]}>
        <PaintingArt style={style} bg={bg} accent={accent} />
      </group>
      {lit && <pointLight position={[0, 0.75, 0.4]} intensity={0.7} color={accent} distance={2.4} decay={2} />}
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
