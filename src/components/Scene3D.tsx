import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import CameraRig from './CameraRig';
import Entrance from './Entrance';
import LobbyProps from './LobbyProps';
import Corridor from './Corridor';
import Totem from './Totem';

export default function Scene3D() {
  return (
    <Canvas
      dpr={Math.min(window.devicePixelRatio, 2)}
      camera={{ fov: 60, near: 0.1, far: 60 }}
      gl={{ antialias: true, toneMappingExposure: 1.6 }}
      shadows
    >
      <color attach="background" args={['#0a0a12']} />
      <fog attach="fog" args={['#0a0a12', 10, 22]} />

      <ambientLight intensity={0.9} color="#c9c2ff" />
      <hemisphereLight args={['#8484b0', '#0c0c16', 0.9]} />

      {/* Warm boutique-lobby point lights */}
      <pointLight position={[-2.5, 3, 2]} intensity={4} color="#ffb677" distance={14} decay={2} />
      <pointLight position={[2, 3.2, -2]} intensity={3.2} color="#ffb677" distance={13} decay={2} />
      <pointLight position={[0, 3.5, -9.5]} intensity={5} color="#2dd4bf" distance={11} decay={2} />
      <pointLight position={[0, 4.5, 7]} intensity={3} color="#a855f7" distance={12} decay={2} />

      <Entrance />
      <LobbyProps />
      <Corridor />
      <Totem />

      <CameraRig />

      <EffectComposer>
        <Bloom intensity={0.45} luminanceThreshold={0.5} luminanceSmoothing={0.25} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
