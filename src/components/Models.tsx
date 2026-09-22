import { useGLTF } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

// Free, properly-licensed low-poly .glb models from poly.pizza, downloaded
// into public/models/. See public/models/CREDITS.md for sources/licenses.

// --- Sofa: "Lounge Design Sofa Corner" by Kenney (CC0) ---

interface SofaNodes {
  loungeDesignSofaCorner_2: THREE.Mesh;
  loungeDesignSofaCorner_2_1: THREE.Mesh;
  loungeDesignSofaCorner_3: THREE.Mesh;
  loungeDesignSofaCorner_3_1: THREE.Mesh;
  Group: THREE.Mesh;
}
interface SofaMaterials {
  carpetBlue: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
}
type SofaGLTF = GLTF & { nodes: SofaNodes; materials: SofaMaterials };

export function SofaModel(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/models/sofa.glb') as unknown as SofaGLTF;

  useLayoutEffect(() => {
    materials.carpetBlue.color.set('#2e3648');
    materials.carpetBlue.roughness = 0.85;
    // "metal" is actually the large base trim/plinth, not a small metal
    // part — keep it non-metallic (matches the source data) or it turns
    // into a blown-out chrome sheet under the environment lighting.
    materials.metal.color.set('#1a1c28');
    materials.metal.roughness = 0.7;
    materials.metal.metalness = 0;
  }, [materials]);

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Group.geometry} material={materials.metal} castShadow receiveShadow />
      <mesh
        geometry={nodes.loungeDesignSofaCorner_2.geometry}
        material={materials.carpetBlue}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={nodes.loungeDesignSofaCorner_2_1.geometry}
        material={materials.metal}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={nodes.loungeDesignSofaCorner_3.geometry}
        material={materials.metal}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={nodes.loungeDesignSofaCorner_3_1.geometry}
        material={materials.carpetBlue}
        castShadow
        receiveShadow
      />
    </group>
  );
}

// --- Potted plant: "Potted Plant" by Kenney (CC0) ---

interface PlantNodes {
  pottedPlant_2: THREE.Mesh;
  pottedPlant_2_1: THREE.Mesh;
  pottedPlant_3: THREE.Mesh;
  pottedPlant_3_1: THREE.Mesh;
  plant: THREE.Mesh;
}
interface PlantMaterials {
  wood: THREE.MeshStandardMaterial;
  woodDark: THREE.MeshStandardMaterial;
  plant: THREE.MeshStandardMaterial;
}
type PlantGLTF = GLTF & { nodes: PlantNodes; materials: PlantMaterials };

export function PlantModel(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/models/plant.glb') as unknown as PlantGLTF;

  useLayoutEffect(() => {
    materials.wood.color.set('#4a3324');
    materials.woodDark.color.set('#2c1e15');
    materials.plant.color.set('#1f6f5c');
  }, [materials]);

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.plant.geometry} material={materials.plant} castShadow />
      <mesh geometry={nodes.pottedPlant_2.geometry} material={materials.wood} castShadow receiveShadow />
      <mesh geometry={nodes.pottedPlant_2_1.geometry} material={materials.woodDark} castShadow receiveShadow />
      <mesh geometry={nodes.pottedPlant_3.geometry} material={materials.woodDark} castShadow receiveShadow />
      <mesh geometry={nodes.pottedPlant_3_1.geometry} material={materials.wood} castShadow receiveShadow />
    </group>
  );
}

// --- Reception desk: "Desk" by Kenney (CC0) ---

interface DeskNodes {
  desk: THREE.Mesh;
  desk_1: THREE.Mesh;
  drawer_1: THREE.Mesh;
  drawer_1_1: THREE.Mesh;
}
interface DeskMaterials {
  wood: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
}
type DeskGLTF = GLTF & { nodes: DeskNodes; materials: DeskMaterials };

export function DeskModel(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/models/desk.glb') as unknown as DeskGLTF;

  useLayoutEffect(() => {
    materials.wood.color.set('#1d2a34');
    materials.wood.roughness = 0.45;
    materials.wood.metalness = 0.25;
    materials.metal.color.set('#2dd4bf');
    materials.metal.roughness = 0.3;
    materials.metal.metalness = 0.6;
  }, [materials]);

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.desk.geometry} material={materials.wood} castShadow receiveShadow />
      <mesh geometry={nodes.desk_1.geometry} material={materials.wood} castShadow receiveShadow />
      <mesh geometry={nodes.drawer_1.geometry} material={materials.wood} castShadow receiveShadow />
      <mesh geometry={nodes.drawer_1_1.geometry} material={materials.metal} />
    </group>
  );
}

useGLTF.preload('/models/sofa.glb');
useGLTF.preload('/models/plant.glb');
useGLTF.preload('/models/desk.glb');
