import { useAnimations, useGLTF } from '@react-three/drei';
import { useGraph, type ThreeElements } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';
import { SkeletonUtils } from 'three-stdlib';

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

// --- Receptionist: "Business Man" by Quaternius (CC0) ---
// A full rigged/animated character (Quaternius's animated-character rig) —
// far more than we need, but it means a real idle animation is available
// instead of a static pose.

interface ReceptionistNodes {
  Suit_Legs: THREE.SkinnedMesh;
  Suit_Feet: THREE.SkinnedMesh;
  Suit_Body_1: THREE.SkinnedMesh;
  Suit_Body_2: THREE.SkinnedMesh;
  Suit_Body_3: THREE.SkinnedMesh;
  Suit_Body_4: THREE.SkinnedMesh;
  Suit_Head_1: THREE.SkinnedMesh;
  Suit_Head_2: THREE.SkinnedMesh;
  Suit_Head_3: THREE.SkinnedMesh;
  Suit_Head_4: THREE.SkinnedMesh;
  Root: THREE.Bone;
}
interface ReceptionistMaterials {
  Suit: THREE.MeshStandardMaterial;
  Black: THREE.MeshStandardMaterial;
  White: THREE.MeshStandardMaterial;
  Tie: THREE.MeshStandardMaterial;
  Skin: THREE.MeshStandardMaterial;
  Hair: THREE.MeshStandardMaterial;
  Eyebrows: THREE.MeshStandardMaterial;
  Eye: THREE.MeshStandardMaterial;
}

type PersonProps = ThreeElements['group'] & {
  animation?: string;
  suitColor?: string;
  tieColor?: string;
};

export function ReceptionistModel({
  animation = 'CharacterArmature|Idle_Neutral',
  suitColor = '#1c2430',
  tieColor = '#2dd4bf',
  ...props
}: PersonProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/receptionist.glb');
  // Skinned meshes share a skeleton with the cached source scene — clone it
  // so this instance gets its own, independently posable, skeleton (also
  // lets us reuse this one model file for several differently-dressed,
  // differently-posed background people).
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as unknown as {
    nodes: ReceptionistNodes;
    materials: ReceptionistMaterials;
  };
  const { actions } = useAnimations(animations, group);

  useLayoutEffect(() => {
    materials.Suit.color.set(suitColor);
    materials.Suit.roughness = 0.75;
    materials.Tie.color.set(tieColor);
    materials.Tie.emissive.set(tieColor);
    materials.Tie.emissiveIntensity = 0.25;
  }, [materials, suitColor, tieColor]);

  useEffect(() => {
    const clip = actions[animation] ?? actions['CharacterArmature|Idle_Neutral'] ?? actions['CharacterArmature|Idle'];
    clip?.reset().fadeIn(0.3).play();
    return () => {
      clip?.fadeOut(0.2);
    };
  }, [actions, animation]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="CharacterArmature" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <primitive object={nodes.Root} />
      </group>
      <skinnedMesh
        geometry={nodes.Suit_Legs.geometry}
        material={materials.Suit}
        skeleton={nodes.Suit_Legs.skeleton}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
        castShadow
      />
      <skinnedMesh
        geometry={nodes.Suit_Feet.geometry}
        material={materials.Black}
        skeleton={nodes.Suit_Feet.skeleton}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
        castShadow
      />
      <group position={[0, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <skinnedMesh geometry={nodes.Suit_Body_1.geometry} material={materials.Suit} skeleton={nodes.Suit_Body_1.skeleton} castShadow />
        <skinnedMesh geometry={nodes.Suit_Body_2.geometry} material={materials.White} skeleton={nodes.Suit_Body_2.skeleton} castShadow />
        <skinnedMesh geometry={nodes.Suit_Body_3.geometry} material={materials.Tie} skeleton={nodes.Suit_Body_3.skeleton} castShadow />
        <skinnedMesh geometry={nodes.Suit_Body_4.geometry} material={materials.Skin} skeleton={nodes.Suit_Body_4.skeleton} castShadow />
      </group>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <skinnedMesh geometry={nodes.Suit_Head_1.geometry} material={materials.Skin} skeleton={nodes.Suit_Head_1.skeleton} castShadow />
        <skinnedMesh geometry={nodes.Suit_Head_2.geometry} material={materials.Hair} skeleton={nodes.Suit_Head_2.skeleton} castShadow />
        <skinnedMesh geometry={nodes.Suit_Head_3.geometry} material={materials.Eyebrows} skeleton={nodes.Suit_Head_3.skeleton} castShadow />
        <skinnedMesh geometry={nodes.Suit_Head_4.geometry} material={materials.Eye} skeleton={nodes.Suit_Head_4.skeleton} castShadow />
      </group>
    </group>
  );
}

// --- Framed art: "Wall Art 03/05/06" by Jarlan Perez (CC-BY) ---
// Real printed canvas art with a proper frame + mat, not an emissive
// primitive composition — see public/models/CREDITS.md for attribution.

const PAINTING_FILES = {
  a: '/models/painting-a.glb',
  b: '/models/painting-b.glb',
  c: '/models/painting-c.glb',
} as const;
type PaintingVariant = keyof typeof PAINTING_FILES;

export function PaintingModel({
  variant,
  ...props
}: ThreeElements['group'] & { variant: PaintingVariant }) {
  const { scene } = useGLTF(PAINTING_FILES[variant]);
  const clone = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clone} {...props} />;
}

// --- Rubber fig: "Rubber fig potted plant" by Poly by Google (CC-BY) ---

export function RubberFigModel(props: ThreeElements['group']) {
  const { scene } = useGLTF('/models/rubberfig.glb');
  const clone = useMemo(() => scene.clone(), [scene]);
  return <primitive object={clone} {...props} />;
}

useGLTF.preload('/models/sofa.glb');
useGLTF.preload('/models/plant.glb');
useGLTF.preload('/models/desk.glb');
useGLTF.preload('/models/receptionist.glb');
useGLTF.preload('/models/painting-a.glb');
useGLTF.preload('/models/painting-b.glb');
useGLTF.preload('/models/painting-c.glb');
useGLTF.preload('/models/rubberfig.glb');
