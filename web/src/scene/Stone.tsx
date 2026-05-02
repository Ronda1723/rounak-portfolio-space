import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import type { Artifact } from "../config/planets";
import { useGameStore } from "../state/useGameStore";

type Props = {
  artifact: Artifact;
  position: [number, number, number];
};

const PEDESTAL_HEIGHT = 0.85;
const STONE_HOVER_HEIGHT = PEDESTAL_HEIGHT + 0.55;

export function Stone({ artifact, position }: Props) {
  const stoneRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const openArtifact = useGameStore((s) => s.openArtifact);
  const active = useGameStore((s) => s.activeArtifact);
  const isActive = active?.id === artifact.id;

  useFrame((_, dt) => {
    if (stoneRef.current) {
      // Slow rotation + subtle bob
      stoneRef.current.rotation.y += dt * 0.6;
      const t = performance.now() * 0.001;
      stoneRef.current.position.y =
        STONE_HOVER_HEIGHT + Math.sin(t * 1.5) * 0.06;
    }
    if (glowRef.current) {
      const t = performance.now() * 0.002;
      const pulse = 1 + Math.sin(t * 2) * 0.15;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const onPointerOver = () => {
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  const onPointerOut = () => {
    setHovered(false);
    document.body.style.cursor = "";
  };

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        openArtifact(artifact);
      }}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* Pedestal — stepped cylinder */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.62, 0.3, 24]} />
        <meshStandardMaterial color="#1a1d24" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.5, 0.2, 24]} />
        <meshStandardMaterial color="#2a2d34" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.42, 0.15, 24]} />
        <meshStandardMaterial color="#3a3d44" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* Glow disc on top of pedestal */}
      <mesh position={[0, 0.69, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.34, 32]} />
        <meshBasicMaterial
          color={artifact.color}
          transparent
          opacity={isActive ? 1 : hovered ? 0.85 : 0.55}
          toneMapped={false}
        />
      </mesh>

      {/* The stone itself — faceted icosahedron, glowing */}
      <mesh ref={stoneRef} position={[0, STONE_HOVER_HEIGHT, 0]} castShadow>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color={artifact.color}
          emissive={artifact.color}
          emissiveIntensity={isActive ? 1.6 : hovered ? 1.1 : 0.7}
          metalness={0.4}
          roughness={0.18}
          toneMapped={false}
        />
      </mesh>

      {/* Outer glow halo (additive sphere around the stone) */}
      <mesh ref={glowRef} position={[0, STONE_HOVER_HEIGHT, 0]}>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshBasicMaterial
          color={artifact.color}
          transparent
          opacity={hovered || isActive ? 0.18 : 0.08}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Point light contribution from the stone */}
      <pointLight
        color={artifact.color}
        intensity={hovered || isActive ? 4 : 2}
        distance={4}
        decay={2}
        position={[0, STONE_HOVER_HEIGHT, 0]}
      />

      {/* Plaque — small black slab in front of pedestal with the artifact name */}
      <mesh position={[0, 0.45, 0.55]} rotation={[-Math.PI / 6, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.12, 0.04]} />
        <meshStandardMaterial
          color="#0e1320"
          metalness={0.6}
          roughness={0.4}
          emissive={artifact.color}
          emissiveIntensity={hovered ? 0.4 : 0.15}
        />
      </mesh>
    </group>
  );
}
