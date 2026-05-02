import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh } from "three";
import type { Satellite as SatelliteType } from "../config/satellites";
import { useGameStore } from "../state/useGameStore";

type Props = {
  satellite: SatelliteType;
};

export function Satellite({ satellite }: Props) {
  const orbitRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const blinkRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const openSatellite = useGameStore((s) => s.openSatellite);
  const setHoveredSat = useGameStore((s) => s.setHoveredSatellite);

  useFrame((_, dt) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += dt * satellite.orbitSpeed;
    }
    if (bodyRef.current) {
      // Slow tumble so it feels alive
      bodyRef.current.rotation.y += dt * 0.25;
      bodyRef.current.rotation.x += dt * 0.05;
    }
    if (blinkRef.current) {
      const t = performance.now() * 0.003;
      const v = (Math.sin(t * 2) + 1) * 0.5;
      const mat = blinkRef.current.material as { opacity: number };
      mat.opacity = 0.4 + v * 0.6;
    }
  });

  const onPointerOver = () => {
    setHovered(true);
    setHoveredSat(satellite);
    document.body.style.cursor = "pointer";
  };
  const onPointerOut = () => {
    setHovered(false);
    setHoveredSat(null);
    document.body.style.cursor = "";
  };
  const onClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    openSatellite(satellite);
  };

  return (
    <group ref={orbitRef} rotation={[0, satellite.orbitAngle, 0]}>
      <group
        position={[satellite.orbitRadius, satellite.inclination, 0]}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      >
        <group ref={bodyRef}>
          {/* Central body: brushed steel cube */}
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.28, 0.32]} />
            <meshStandardMaterial
              color="#b0b8be"
              metalness={0.92}
              roughness={0.28}
              emissive={hovered ? satellite.accent : "#000000"}
              emissiveIntensity={hovered ? 0.4 : 0}
            />
          </mesh>

          {/* Top accent strip */}
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.34, 0.02, 0.34]} />
            <meshStandardMaterial
              color={satellite.accent}
              emissive={satellite.accent}
              emissiveIntensity={0.6}
              toneMapped={false}
            />
          </mesh>

          {/* Solar panel wings */}
          {[-1, 1].map((dir) => (
            <group key={dir} position={[dir * 0.18, 0, 0]}>
              {/* Boom arm */}
              <mesh position={[dir * 0.15, 0, 0]}>
                <boxGeometry args={[0.3, 0.018, 0.04]} />
                <meshStandardMaterial
                  color="#6c757d"
                  metalness={0.85}
                  roughness={0.4}
                />
              </mesh>
              {/* Panel */}
              <mesh position={[dir * 0.55, 0, 0]} castShadow>
                <boxGeometry args={[0.5, 0.02, 0.36]} />
                <meshStandardMaterial
                  color="#0e1d3a"
                  metalness={0.4}
                  roughness={0.35}
                  emissive="#0a1f44"
                  emissiveIntensity={0.4}
                />
              </mesh>
              {/* Panel grid lines (subtle) */}
              <mesh position={[dir * 0.55, 0.011, 0]}>
                <boxGeometry args={[0.5, 0.001, 0.005]} />
                <meshStandardMaterial color="#1f3057" />
              </mesh>
            </group>
          ))}

          {/* Dish antenna */}
          <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2.2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.04, 0.04, 16, 1, true]} />
            <meshStandardMaterial
              color="#dde2e6"
              metalness={0.88}
              roughness={0.2}
              side={2}
            />
          </mesh>
          <mesh position={[0, 0, 0.27]}>
            <sphereGeometry args={[0.018, 8, 6]} />
            <meshBasicMaterial color={satellite.accent} toneMapped={false} />
          </mesh>

          {/* Blinking nav light underneath */}
          <mesh ref={blinkRef} position={[0, -0.16, 0]}>
            <sphereGeometry args={[0.025, 10, 8]} />
            <meshBasicMaterial
              color={satellite.accent}
              transparent
              opacity={0.8}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Hover halo */}
        {hovered && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.72, 0.86, 48]} />
            <meshBasicMaterial
              color={satellite.accent}
              transparent
              opacity={0.6}
              toneMapped={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}
