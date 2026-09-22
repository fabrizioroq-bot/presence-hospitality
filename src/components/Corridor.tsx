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

// A single directional stream of data flowing from the corridor entrance
// and converging onto the totem screen — reinforcing "everything connects
// here" instead of scattered ambient clutter. Stops short of the totem so
// it never overlaps the receptionist model.
const STREAM_COUNT = 7;
const STREAM_Z_START = 3.5;
const STREAM_Z_END = -9.15;
const STREAM_TARGET = new THREE.Vector3(0, 1.556, STREAM_Z_END);

function DataStream() {
  const groupRef = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: STREAM_COUNT }, () => ({
        startX: (Math.random() - 0.5) * 3,
        startY: 0.7 + Math.random() * 1.4,
        phase: Math.random(),
        color: Math.random() > 0.5 ? '#2dd4bf' : '#a855f7',
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const s = seeds[i];
      const u = (t * 0.07 + s.phase) % 1;
      const ease = u * u;
      child.position.set(
        THREE.MathUtils.lerp(s.startX, STREAM_TARGET.x, ease),
        THREE.MathUtils.lerp(s.startY, STREAM_TARGET.y, ease),
        THREE.MathUtils.lerp(STREAM_Z_START, STREAM_Z_END, u),
      );
      child.scale.setScalar(1 - ease * 0.5);
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.45 * (1 - ease * 0.3);
    });
  });

  return (
    <group ref={groupRef}>
      {seeds.map((s, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.55, 6]} />
          <meshBasicMaterial color={s.color} transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  );
}

export default function Corridor() {
  return (
    <group>
      <Columns />
      <DataStream />
    </group>
  );
}
