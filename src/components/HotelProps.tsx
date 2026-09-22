import { RoundedBox } from '@react-three/drei';

// Matches Walls.tsx's WALL_X — kept local since it's only used for placement here.
const WALL_X = 4.2;

function LuggageCart({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.6, 0.03, 0.4]} />
        <meshStandardMaterial color="#2a2c3a" metalness={0.6} roughness={0.4} />
      </mesh>
      {[
        [-0.24, -0.16],
        [0.24, -0.16],
        [-0.24, 0.16],
        [0.24, 0.16],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.08, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
          <meshStandardMaterial color="#111219" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.55, -0.18]}>
        <boxGeometry args={[0.5, 0.03, 0.03]} />
        <meshStandardMaterial color="#2a2c3a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.22, 0.4, -0.18]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#2a2c3a" />
      </mesh>
      <mesh position={[0.22, 0.4, -0.18]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#2a2c3a" />
      </mesh>
      <RoundedBox args={[0.32, 0.22, 0.28]} radius={0.02} position={[-0.08, 0.42, 0.02]} rotation={[0, 0.15, 0]} castShadow>
        <meshStandardMaterial color="#7a4a2f" roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.24, 0.18, 0.22]} radius={0.02} position={[0.11, 0.64, -0.03]} rotation={[0, -0.12, 0]} castShadow>
        <meshStandardMaterial color="#2f4a5a" roughness={0.7} />
      </RoundedBox>
    </group>
  );
}

function ElevatorDoors({ z, side }: { z: number; side: 1 | -1 }) {
  const faceX = WALL_X * side - side * 0.065;
  const rotY = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return (
    <group position={[faceX, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 1.35, -0.02]}>
        <boxGeometry args={[1.5, 2.5, 0.06]} />
        <meshStandardMaterial color="#12131d" roughness={0.6} />
      </mesh>
      <mesh position={[-0.36, 1.3, 0.01]}>
        <boxGeometry args={[0.7, 2.3, 0.04]} />
        <meshStandardMaterial color="#3d4155" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0.36, 1.3, 0.01]}>
        <boxGeometry args={[0.7, 2.3, 0.04]} />
        <meshStandardMaterial color="#3d4155" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0, 2.72, 0.02]}>
        <circleGeometry args={[0.05, 16]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={1.3} />
      </mesh>
      <pointLight position={[0, 2.4, 0.6]} intensity={0.8} color="#8f97ff" distance={2.5} decay={2} />
    </group>
  );
}

export default function HotelProps() {
  return (
    <group>
      <LuggageCart position={[-1.8, 0, 3.6]} rotationY={0.5} />
      <ElevatorDoors z={0.1} side={1} />
    </group>
  );
}
