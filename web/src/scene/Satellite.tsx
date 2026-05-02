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
      // Gentle drift so it feels alive, but not spinning fast (panels stay readable)
      bodyRef.current.rotation.y += dt * 0.08;
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

  // Reusable white hull material params via inline standardMaterial
  const HULL_WHITE = "#f0f1f3";
  const HULL_TRIM = "#cdd2d7";

  return (
    <group ref={orbitRef} rotation={[0, satellite.orbitAngle, 0]}>
      <group
        position={[satellite.orbitRadius, satellite.inclination, 0]}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      >
        <group ref={bodyRef}>
          {/* ── Main body: 3 cylinder segments along X axis ─────────────── */}
          {/* Aft section (wider, has the engine/docking port end) */}
          <mesh
            position={[-0.55, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.28, 0.28, 0.45, 32]} />
            <meshStandardMaterial
              color={HULL_WHITE}
              metalness={0.5}
              roughness={0.32}
              envMapIntensity={1.4}
              emissive={hovered ? satellite.accent : "#000000"}
              emissiveIntensity={hovered ? 0.25 : 0}
            />
          </mesh>

          {/* Aft cap ring (the dark recessed engine/port at the back) */}
          <mesh position={[-0.78, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.04, 32]} />
            <meshStandardMaterial color="#3a3f45" metalness={0.85} roughness={0.4} />
          </mesh>

          {/* Mid section (slightly slimmer, accordion / radiator look) */}
          <mesh
            position={[-0.13, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.26, 0.26, 0.4, 32]} />
            <meshStandardMaterial
              color={HULL_WHITE}
              metalness={0.5}
              roughness={0.34}
            />
          </mesh>

          {/* Mid panel rings (subtle structural rings) */}
          {[-0.03, 0.05, 0.13].map((x, i) => (
            <mesh
              key={`ring-${i}`}
              position={[x - 0.13, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.265, 0.265, 0.012, 32]} />
              <meshStandardMaterial
                color={HULL_TRIM}
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
          ))}

          {/* Forward section (slightly narrower) */}
          <mesh
            position={[0.32, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.24, 0.24, 0.5, 32]} />
            <meshStandardMaterial
              color={HULL_WHITE}
              metalness={0.5}
              roughness={0.32}
            />
          </mesh>

          {/* Forward dome / nose section */}
          <mesh position={[0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.18, 0.24, 0.12, 32]} />
            <meshStandardMaterial
              color={HULL_WHITE}
              metalness={0.5}
              roughness={0.32}
            />
          </mesh>
          <mesh position={[0.7, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <sphereGeometry args={[0.18, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color={HULL_WHITE}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>

          {/* Forward docking port (small dark ring at the very front) */}
          <mesh position={[0.86, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.05, 24]} />
            <meshStandardMaterial color="#2c3036" metalness={0.85} roughness={0.4} />
          </mesh>

          {/* Cupola dome on top (dark glass observation pod) */}
          <mesh position={[0.18, 0.24, 0]}>
            <sphereGeometry args={[0.11, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color="#0e1320"
              metalness={0.95}
              roughness={0.05}
              envMapIntensity={2.6}
            />
          </mesh>
          <mesh position={[0.18, 0.18, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.06, 18]} />
            <meshStandardMaterial color={HULL_TRIM} metalness={0.7} roughness={0.35} />
          </mesh>

          {/* ── Solar panel wings (4 segments per wing) ─────────────────── */}
          {[-1, 1].map((dir) => (
            <group key={dir} position={[0, 0, dir * 0.35]}>
              {/* Yoke / boom arm connecting wing to body */}
              <mesh position={[0, 0, dir * 0.05]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
                <meshStandardMaterial color="#9ea4aa" metalness={0.85} roughness={0.4} />
              </mesh>

              {/* 4 panel segments */}
              {[0, 1, 2, 3].map((i) => {
                const segOffset = 0.32 + i * 0.42;
                return (
                  <group key={i} position={[0, 0, dir * segOffset]}>
                    <mesh castShadow>
                      <boxGeometry args={[0.85, 0.018, 0.4]} />
                      <meshStandardMaterial
                        color="#0a1430"
                        metalness={0.5}
                        roughness={0.3}
                        emissive="#0a2050"
                        emissiveIntensity={0.55}
                      />
                    </mesh>
                    {/* Panel border */}
                    <mesh position={[0, 0.011, 0]}>
                      <boxGeometry args={[0.86, 0.001, 0.41]} />
                      <meshStandardMaterial
                        color="#2a3760"
                        metalness={0.6}
                        roughness={0.35}
                      />
                    </mesh>
                    {/* Vertical grid line down the middle */}
                    <mesh position={[0, 0.012, 0]}>
                      <boxGeometry args={[0.86, 0.0008, 0.004]} />
                      <meshStandardMaterial color="#3a4a78" />
                    </mesh>
                    {/* Horizontal split */}
                    <mesh position={[0, 0.012, 0]}>
                      <boxGeometry args={[0.004, 0.0008, 0.4]} />
                      <meshStandardMaterial color="#3a4a78" />
                    </mesh>
                  </group>
                );
              })}
            </group>
          ))}

          {/* Long communications antenna boom on side */}
          <mesh position={[-0.2, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.45, 8]} />
            <meshStandardMaterial color="#9ea4aa" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[-0.2, -0.5, 0]}>
            <sphereGeometry args={[0.025, 10, 8]} />
            <meshStandardMaterial color={HULL_TRIM} metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Small accent stripe on body (color-coded per satellite) */}
          <mesh position={[0.32, 0.245, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.241, 0.241, 0.04, 32]} />
            <meshStandardMaterial
              color={satellite.accent}
              emissive={satellite.accent}
              emissiveIntensity={0.5}
              toneMapped={false}
            />
          </mesh>

          {/* Blinking nav light */}
          <mesh ref={blinkRef} position={[-0.55, -0.3, 0]}>
            <sphereGeometry args={[0.035, 10, 8]} />
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
            <ringGeometry args={[1.4, 1.6, 64]} />
            <meshBasicMaterial
              color={satellite.accent}
              transparent
              opacity={0.55}
              toneMapped={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}
