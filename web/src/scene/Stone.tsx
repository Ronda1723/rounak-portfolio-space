import { useRef, useState } from "react";
import { Billboard, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Group, Mesh } from "three";
import type { Artifact } from "../config/planets";
import { useGameStore } from "../state/useGameStore";

type Props = {
  artifact: Artifact;
  position: [number, number, number];
};

const PEDESTAL_HEIGHT = 1.0;
const STONE_HOVER = PEDESTAL_HEIGHT + 0.45;
const HOLOGRAM_Y = PEDESTAL_HEIGHT + 1.45;

export function Stone({ artifact, position }: Props) {
  const stoneRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const holoRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  const openArtifact = useGameStore((s) => s.openArtifact);
  const active = useGameStore((s) => s.activeArtifact);
  const isActive = active?.id === artifact.id;

  useFrame((_, dt) => {
    const t = performance.now() * 0.001;
    if (stoneRef.current) {
      stoneRef.current.rotation.y += dt * 0.5;
      stoneRef.current.position.y = STONE_HOVER + Math.sin(t * 1.5) * 0.05;
    }
    if (glowRef.current) {
      const pulse = 1 + Math.sin(t * 2) * 0.12;
      glowRef.current.scale.setScalar(pulse);
    }
    if (holoRef.current) {
      // Subtle hologram float + flicker
      holoRef.current.position.y = HOLOGRAM_Y + Math.sin(t * 1.3) * 0.04;
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
      {/* Single clean pedestal — a slim matte block */}
      <mesh position={[0, PEDESTAL_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, PEDESTAL_HEIGHT, 0.7]} />
        <meshStandardMaterial
          color="#f4f0e8"
          metalness={0.05}
          roughness={0.55}
        />
      </mesh>
      {/* Tiny base shadow line so it reads as resting on the floor */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.36, 0.42, 32]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      {/* Glass vitrine — single cylinder, no dome, no rings */}
      <mesh position={[0, PEDESTAL_HEIGHT + 0.5, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 1.0, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          metalness={0}
          roughness={0.04}
          transmission={0.95}
          thickness={0.05}
          ior={1.45}
          side={2}
        />
      </mesh>

      {/* The stone — slowly rotating, gently bobbing */}
      <mesh ref={stoneRef} position={[0, STONE_HOVER, 0]} castShadow>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color={artifact.color}
          emissive={artifact.color}
          emissiveIntensity={isActive ? 1.5 : hovered ? 1.0 : 0.7}
          metalness={0.4}
          roughness={0.18}
          toneMapped={false}
        />
      </mesh>

      {/* Soft outer glow */}
      <mesh ref={glowRef} position={[0, STONE_HOVER, 0]}>
        <sphereGeometry args={[0.4, 16, 12]} />
        <meshBasicMaterial
          color={artifact.color}
          transparent
          opacity={hovered || isActive ? 0.16 : 0.07}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Stone-tinted point light */}
      <pointLight
        color={artifact.color}
        intensity={hovered || isActive ? 3 : 1.5}
        distance={3.5}
        decay={2}
        position={[0, STONE_HOVER, 0]}
      />

      {/* ── Holographic label floating above the vitrine ────── */}
      {/* Faint projection beam from stone to hologram */}
      <mesh position={[0, (STONE_HOVER + HOLOGRAM_Y) / 2, 0]}>
        <cylinderGeometry args={[0.004, 0.018, HOLOGRAM_Y - STONE_HOVER, 8]} />
        <meshBasicMaterial
          color={artifact.color}
          transparent
          opacity={0.25}
          toneMapped={false}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <group ref={holoRef} position={[0, HOLOGRAM_Y, 0]}>
        <Billboard>
          {/* Top bracket */}
          <mesh position={[0, 0.18, 0]}>
            <planeGeometry args={[0.9, 0.006]} />
            <meshBasicMaterial color={artifact.color} toneMapped={false} />
          </mesh>
          {/* Top corner ticks */}
          {[-1, 1].map((s) => (
            <mesh key={`tickt-${s}`} position={[s * 0.45, 0.155, 0]}>
              <planeGeometry args={[0.006, 0.06]} />
              <meshBasicMaterial color={artifact.color} toneMapped={false} />
            </mesh>
          ))}

          {/* Main label */}
          <Text
            position={[0, 0.0, 0]}
            fontSize={0.13}
            anchorX="center"
            anchorY="middle"
            outlineColor={artifact.color}
            outlineWidth={0.003}
            outlineOpacity={0.5}
            letterSpacing={0.02}
          >
            {artifact.name}
            <meshBasicMaterial
              color={artifact.color}
              toneMapped={false}
              transparent
              opacity={0.95}
            />
          </Text>

          {/* Sub-label "ARTIFACT" */}
          <Text
            position={[0, -0.13, 0]}
            fontSize={0.04}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.36}
          >
            ARTIFACT
            <meshBasicMaterial
              color={artifact.color}
              toneMapped={false}
              transparent
              opacity={0.7}
            />
          </Text>

          {/* Bottom bracket */}
          <mesh position={[0, -0.2, 0]}>
            <planeGeometry args={[0.9, 0.006]} />
            <meshBasicMaterial color={artifact.color} toneMapped={false} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={`tickb-${s}`} position={[s * 0.45, -0.175, 0]}>
              <planeGeometry args={[0.006, 0.06]} />
              <meshBasicMaterial color={artifact.color} toneMapped={false} />
            </mesh>
          ))}
        </Billboard>
      </group>
    </group>
  );
}
