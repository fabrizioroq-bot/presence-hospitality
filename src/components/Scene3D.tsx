import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import CameraRig from './CameraRig';
import Entrance from './Entrance';
import LobbyProps from './LobbyProps';
import Corridor from './Corridor';
import Walls from './Walls';
import Reception from './Reception';
import HotelProps from './HotelProps';
import Totem from './Totem';

export default function Scene3D() {
  return (
    <Canvas
      dpr={Math.min(window.devicePixelRatio, 2)}
      camera={{ fov: 60, near: 0.1, far: 60 }}
      gl={{ antialias: true, toneMappingExposure: 1.7 }}
      shadows
    >
      <color attach="background" args={['#0a0a12']} />
      <fog attach="fog" args={['#0a0a12', 13, 25]} />

      {/* Procedural environment (no external HDRI fetch) — gives materials soft
          IBL reflections/highlights instead of flat, direct-light-only shading. */}
      <Environment resolution={64} environmentIntensity={0.45}>
        <Lightformer form="rect" color="#ffcf9e" intensity={3} position={[-3, 3, 2]} scale={[3, 2, 1]} />
        <Lightformer form="rect" color="#ffcf9e" intensity={2.5} position={[3, 3, -3]} scale={[3, 2, 1]} />
        <Lightformer form="rect" color="#2dd4bf" intensity={2} position={[0, 2, -10]} scale={[4, 2, 1]} />
        <Lightformer form="ring" color="#a855f7" intensity={2} position={[0, 4, 5]} scale={3} />
        <Lightformer form="circle" color="#4b4a6a" intensity={1} position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]} scale={10} />
      </Environment>

      <ambientLight intensity={0.55} color="#c9c2ff" />
      <hemisphereLight args={['#8c8cb8', '#0c0c16', 0.6]} />

      {/* Warm boutique-lobby point lights (~2800K) */}
      <pointLight position={[-2.5, 3, 2]} intensity={3.6} color="#ffb877" distance={14} decay={2} />
      <pointLight position={[2, 3.2, -2]} intensity={2.8} color="#ffb877" distance={13} decay={2} />
      {/* cooler teal/violet accents for depth */}
      <pointLight position={[0, 3.5, -9.5]} intensity={4} color="#2dd4bf" distance={11} decay={2} />
      <pointLight position={[0, 4.5, 7]} intensity={2.6} color="#a855f7" distance={12} decay={2} />

      <Entrance />
      <LobbyProps />
      <Corridor />
      <Walls />
      <HotelProps />
      <Reception />
      <Totem />

      <CameraRig />

      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.55} luminanceSmoothing={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.18} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
