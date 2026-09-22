import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import { getWoodFloorTexture } from '../lib/textures';

function Sofa({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.6, 0.45, 0.7]} radius={0.08} position={[0, 0.25, 0]} castShadow>
        <meshStandardMaterial color="#2e3648" roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[1.6, 0.6, 0.2]} radius={0.08} position={[0, 0.55, -0.28]} castShadow>
        <meshStandardMaterial color="#333d52" roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.22, 0.5, 0.7]} radius={0.06} position={[-0.75, 0.35, 0]} castShadow>
        <meshStandardMaterial color="#333d52" roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.22, 0.5, 0.7]} radius={0.06} position={[0.75, 0.35, 0]} castShadow>
        <meshStandardMaterial color="#333d52" roughness={0.7} />
      </RoundedBox>
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.5, 16]} />
        <meshStandardMaterial color="#232840" roughness={0.6} />
      </mesh>
      {[
        [0, 0.9, 0, 0.35],
        [0.15, 1.05, 0.1, 0.28],
        [-0.18, 1.0, -0.12, 0.26],
        [0.05, 1.3, -0.1, 0.24],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 10, 10]} />
          <meshStandardMaterial color="#1f6f5c" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function DashboardPanel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, Math.PI / 10, 0]}>
      <mesh>
        <planeGeometry args={[1.5, 0.95]} />
        <meshStandardMaterial color="#0f2f2a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.28, 0.01]}>
        <planeGeometry args={[1.3, 0.18]} />
        <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={1.1} />
      </mesh>
      {[-0.4, 0, 0.4].map((x, i) => (
        <mesh key={i} position={[x, -0.05, 0.01]}>
          <planeGeometry args={[0.32, 0.55]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={0.5 + i * 0.15}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function LobbyProps() {
  const woodTexture = useMemo(() => getWoodFloorTexture(), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[8.2, 22]} />
        <meshStandardMaterial map={woodTexture} roughness={0.58} metalness={0.04} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.1, 0.011, 1.4]}>
        <planeGeometry args={[2.4, 2]} />
        <meshStandardMaterial color="#2a1f2e" roughness={1} />
      </mesh>

      <Sofa position={[2.4, 0, 1.4]} />
      <Plant position={[-2.6, 0, 2.2]} />
      <Plant position={[-2.5, 0, -0.6]} />
      <DashboardPanel position={[-2.7, 1.5, 0.6]} />
    </group>
  );
}
