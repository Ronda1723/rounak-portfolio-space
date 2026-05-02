import { useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import type { Artifact } from "../config/planets";
import { useGameStore } from "../state/useGameStore";

type Props = {
  artifact: Artifact;
  position: [number, number, number];
};

const PEDESTAL_TOP = 1.0; // top of pedestal in world Y
const STONE_HOVER_HEIGHT = PEDESTAL_TOP + 0.5;

export function Stone({ artifact, position }: Props) {
  const stoneRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const openArtifact = useGameStore((s) => s.openArtifact);
  const active = useGameStore((s) => s.activeArtifact);
  const isActive = active?.id === artifact.id;

  useFrame((_, dt) => {
    if (stoneRef.current) {
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

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        openArtifact(artifact);
      }}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      {/* ── Pedestal (3-tier brushed-metal) ────────────────────── */}
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.2, 1.3]} />
        <meshStandardMaterial color="#1a1d22" metalness={0.6} roughness={0.45} />
      </mesh>
      {/* Mid block */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.0, 0.7, 1.0]} />
        <meshStandardMaterial color="#2a2d34" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[1.1, 0.1, 1.1]} />
        <meshStandardMaterial color="#3a3d44" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Pedestal name plate (front-facing toward room center) */}
      <group position={[0, 0.55, 0.51]}>
        <mesh>
          <planeGeometry args={[0.85, 0.18]} />
          <meshStandardMaterial color="#0e1320" metalness={0.6} roughness={0.4} />
        </mesh>
        <Text
          position={[0, 0, 0.005]}
          fontSize={0.078}
          color="#e6c98a"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.18}
        >
          {artifact.name.toUpperCase()}
        </Text>
      </group>

      {/* Glow halo on top of pedestal */}
      <mesh position={[0, PEDESTAL_TOP + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.34, 32]} />
        <meshBasicMaterial
          color={artifact.color}
          transparent
          opacity={isActive ? 1 : hovered ? 0.85 : 0.55}
          toneMapped={false}
        />
      </mesh>

      {/* ── Glass vitrine (cylindrical bell jar) ──────────────── */}
      <mesh position={[0, PEDESTAL_TOP + 0.6, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 1.2, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          metalness={0}
          roughness={0.05}
          transmission={0.92}
          thickness={0.08}
          ior={1.45}
          side={2}
          envMapIntensity={1.5}
        />
      </mesh>
      {/* Vitrine top dome */}
      <mesh position={[0, PEDESTAL_TOP + 1.2, 0]}>
        <sphereGeometry args={[0.42, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          metalness={0}
          roughness={0.05}
          transmission={0.92}
          thickness={0.08}
          ior={1.45}
          side={2}
        />
      </mesh>
      {/* Vitrine base ring */}
      <mesh position={[0, PEDESTAL_TOP + 0.02, 0]}>
        <torusGeometry args={[0.42, 0.025, 12, 32]} />
        <meshStandardMaterial color="#3a3d44" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Vitrine top ring */}
      <mesh position={[0, PEDESTAL_TOP + 1.2, 0]}>
        <torusGeometry args={[0.42, 0.022, 12, 32]} />
        <meshStandardMaterial color="#3a3d44" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* ── The stone itself — glowing icosahedron ────────────── */}
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

      {/* Outer glow */}
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

      {/* Stone-tinted point light */}
      <pointLight
        color={artifact.color}
        intensity={hovered || isActive ? 4 : 2}
        distance={4}
        decay={2}
        position={[0, STONE_HOVER_HEIGHT, 0]}
      />
    </group>
  );
}
