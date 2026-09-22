import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COLUMN_Z_RANGE: [number, number] = [2, -7];
const COLUMN_COUNT = 5;
const COLUMN_X = 2.3;

function Columns() {
  const positions = useMemo(() => {
    const [start, end] = COLUMN_Z_RANGE;
    return Array.from({ length: COLUMN_COUNT }, (_, i) => {
      const t = i / (COLUMN_COUNT - 1);
      return start + (end - start) * t;
    });
  }, []);

  return (
    <>
      {positions.map((z, i) => (
        <group key={i}>
          <mesh position={[-COLUMN_X, 1.4, z]} castShadow>
            <cylinderGeometry args={[0.14, 0.16, 2.8, 12]} />
            <meshStandardMaterial color="#282a3c" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[COLUMN_X, 1.4, z]} castShadow>
            <cylinderGeometry args={[0.14, 0.16, 2.8, 12]} />
            <meshStandardMaterial color="#282a3c" metalness={0.3} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </>
  );
}

const STREAK_COUNT = 14;

function LightStreaks() {
  const groupRef = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: STREAK_COUNT }, () => ({
        x: (Math.random() - 0.5) * 4.4,
        y: 0.4 + Math.random() * 2.2,
        z: 2 - Math.random() * 9,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? '#2dd4bf' : '#a855f7',
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const s = seeds[i];
      child.position.z = s.z - ((t * 0.6 + s.phase) % 9);
    });
  });

  return (
    <group ref={groupRef}>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.7, 6]} />
          <meshBasicMaterial color={s.color} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export default function Corridor() {
  return (
    <group>
      <Columns />
      <LightStreaks />
    </group>
  );
}
