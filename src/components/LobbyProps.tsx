import { ContactShadows, Html } from '@react-three/drei';
import { useMemo } from 'react';
import { getWoodFloorTexture } from '../lib/textures';
import { PlantModel, ReceptionistModel, RubberFigModel, SofaModel } from './Models';

// Matches Walls.tsx's WALL_X — wall-mounted like the paintings/clock, so it
// reads as an actual monitor fixed to the wall instead of an unexplained
// panel floating in the middle of the room.
const WALL_X = 4.2;

function DashboardPanel({ z, side }: { z: number; side: 1 | -1 }) {
  const x = WALL_X * side - side * 0.09;
  const rotY = side > 0 ? -Math.PI / 2 : Math.PI / 2;
  return (
    <group position={[x, 1.6, z]} rotation={[0, rotY, 0]}>
      {/* bezel, like a wall-mounted monitor */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[1.62, 1.05, 0.05]} />
        <meshStandardMaterial color="#0c0d16" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* short mounting arm back to the wall */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[0.1, 0.1, 0.07]} />
        <meshStandardMaterial color="#0c0d16" metalness={0.5} roughness={0.5} />
      </mesh>

      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[1.5, 0.95]} />
        <meshStandardMaterial color="#0f2f2a" emissive="#0f2f2a" emissiveIntensity={0.15} roughness={0.5} />
      </mesh>

      {/* Real dashboard content — readable stats + a labeled chart, not
          abstract colored bars with no meaning. */}
      <Html center transform position={[0, 0, 0.02]} distanceFactor={0.66} occlude={false} style={{ pointerEvents: 'none' }}>
        <div className="w-[230px] select-none rounded-md p-3 font-mono">
          <div className="mb-2 flex items-center justify-between border-b border-teal/25 pb-1.5">
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-headline">
              Presence
            </span>
            <span className="rounded-full bg-teal/20 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-widest text-teal">
              Live
            </span>
          </div>
          <div className="space-y-1.5 text-[9px]">
            <div className="flex items-center justify-between">
              <span className="text-white/50">Occupancy</span>
              <span className="font-semibold text-headline">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">Check-ins today</span>
              <span className="font-semibold text-headline">14</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">Open requests</span>
              <span className="font-semibold text-headline">2</span>
            </div>
          </div>
          <div className="mt-2.5 flex h-10 items-end gap-1.5 border-t border-white/10 pt-2">
            {[0.5, 0.8, 0.35, 0.95, 0.6, 0.75].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-teal to-violet"
                style={{ height: `${h * 100}%`, opacity: 0.55 + h * 0.35 }}
              />
            ))}
          </div>
        </div>
      </Html>

      <pointLight position={[0, 0, 0.6]} intensity={0.5} color="#2dd4bf" distance={2.2} decay={2} />
    </group>
  );
}

export default function LobbyProps() {
  const woodTexture = useMemo(() => getWoodFloorTexture(), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]} receiveShadow>
        <planeGeometry args={[8.2, 22]} />
        <meshStandardMaterial map={woodTexture} roughness={0.42} metalness={0.04} envMapIntensity={0.6} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.6, 0.011, 1.2]}>
        <planeGeometry args={[2.8, 2.4]} />
        <meshStandardMaterial color="#2a1f2e" roughness={1} />
      </mesh>

      <ContactShadows position={[2.6, 0.015, 1.2]} width={5} height={4} blur={1.6} opacity={0.55} far={2} />

      <SofaModel position={[3.5, 0, 0.2]} rotation={[0, -Math.PI / 2, 0]} scale={1.5} />
      <RubberFigModel position={[-2.6, 0, 2.4]} scale={0.15} />
      <PlantModel position={[-2.5, 0, -0.6]} scale={1.9} />
      <DashboardPanel z={0.6} side={-1} />

      {/* guest checking out the dashboard panel */}
      <ReceptionistModel
        position={[-1.7, 0, 0.4]}
        rotation={[0, -Math.PI / 2.1, 0]}
        animation="CharacterArmature|Idle_Neutral"
        suitColor="#2b2540"
        tieColor="#a855f7"
      />
      {/* guest near the sofa */}
      <ReceptionistModel
        position={[2.9, 0, 1.3]}
        rotation={[0, Math.PI / 5, 0]}
        animation="CharacterArmature|Idle_Neutral"
        suitColor="#243328"
        tieColor="#ffb877"
      />
    </group>
  );
}
