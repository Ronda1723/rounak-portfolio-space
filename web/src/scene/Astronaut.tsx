import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";

type Props = {
  position?: [number, number, number];
  /** rotation around Y in radians (which way the astronaut is facing) */
  rotationY?: number;
};

const SUIT_WHITE = "#eef0f3";
const SUIT_TRIM = "#3a4148";
const VISOR_DARK = "#0a0e16";
const VISOR_GOLD = "#a87a2a";
const ACCENT_RED = "#d94432";

export function Astronaut({ position = [0, 0, 0], rotationY = 0 }: Props) {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);

  useFrame(() => {
    const t = performance.now() * 0.001;
    if (root.current) {
      // Subtle breathing bob
      root.current.position.y = position[1] + Math.sin(t * 1.2) * 0.025;
    }
    if (head.current) {
      // Slight head sway
      head.current.rotation.y = Math.sin(t * 0.4) * 0.15;
    }
    if (armL.current) {
      armL.current.rotation.x = Math.sin(t * 0.8) * 0.06;
    }
    if (armR.current) {
      armR.current.rotation.x = -Math.sin(t * 0.8) * 0.06;
    }
  });

  return (
    <group ref={root} position={position} rotation={[0, rotationY, 0]}>
      {/* ── Boots ────────────────────────────────────────── */}
      {[-1, 1].map((s) => (
        <mesh key={`boot-${s}`} position={[s * 0.16, 0.08, 0.04]} castShadow>
          <boxGeometry args={[0.22, 0.16, 0.34]} />
          <meshStandardMaterial color={SUIT_TRIM} metalness={0.4} roughness={0.6} />
        </mesh>
      ))}

      {/* ── Legs ────────────────────────────────────────── */}
      {[-1, 1].map((s) => (
        <mesh key={`leg-${s}`} position={[s * 0.16, 0.55, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.55, 6, 12]} />
          <meshStandardMaterial color={SUIT_WHITE} metalness={0.15} roughness={0.55} />
        </mesh>
      ))}

      {/* ── Hip belt ────────────────────────────────────── */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.1, 16]} />
        <meshStandardMaterial color={SUIT_TRIM} metalness={0.5} roughness={0.5} />
      </mesh>

      {/* ── Torso ───────────────────────────────────────── */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <capsuleGeometry args={[0.36, 0.55, 6, 16]} />
        <meshStandardMaterial color={SUIT_WHITE} metalness={0.18} roughness={0.5} />
      </mesh>

      {/* Chest control panel */}
      <mesh position={[0, 1.4, 0.34]} castShadow>
        <boxGeometry args={[0.4, 0.28, 0.06]} />
        <meshStandardMaterial color="#1a1d24" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[-0.13, 1.45, 0.38]}>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshBasicMaterial color={ACCENT_RED} toneMapped={false} />
      </mesh>
      <mesh position={[-0.05, 1.45, 0.38]}>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshBasicMaterial color="#7AFFAD" toneMapped={false} />
      </mesh>
      <mesh position={[0.05, 1.45, 0.38]}>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshBasicMaterial color="#5BC0EB" toneMapped={false} />
      </mesh>

      {/* Backpack (life-support unit) */}
      <mesh position={[0, 1.32, -0.36]} castShadow>
        <boxGeometry args={[0.55, 0.65, 0.28]} />
        <meshStandardMaterial color={SUIT_TRIM} metalness={0.55} roughness={0.45} />
      </mesh>

      {/* ── Arms ────────────────────────────────────────── */}
      {[-1, 1].map((s, i) => {
        const armRef = s === -1 ? armL : armR;
        return (
          <group
            key={`arm-${s}`}
            ref={armRef}
            position={[s * 0.42, 1.4, 0]}
            rotation={[0, 0, s * 0.05]}
          >
            <mesh castShadow>
              <capsuleGeometry args={[0.11, 0.55, 6, 12]} />
              <meshStandardMaterial color={SUIT_WHITE} metalness={0.18} roughness={0.5} />
            </mesh>
            {/* Glove */}
            <mesh position={[0, -0.4, 0]} castShadow>
              <sphereGeometry args={[0.13, 14, 10]} />
              <meshStandardMaterial color={SUIT_TRIM} metalness={0.4} roughness={0.55} />
            </mesh>
            {/* Shoulder ring */}
            <mesh position={[0, 0.32, 0]}>
              <torusGeometry args={[0.13, 0.025, 8, 16]} />
              <meshStandardMaterial color={SUIT_TRIM} metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Suppress unused index warning */}
            <group visible={i >= 0} />
          </group>
        );
      })}

      {/* ── Helmet ──────────────────────────────────────── */}
      <group ref={head} position={[0, 1.92, 0]}>
        {/* Helmet sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.32, 24, 20]} />
          <meshStandardMaterial
            color={SUIT_WHITE}
            metalness={0.25}
            roughness={0.4}
          />
        </mesh>
        {/* Visor — front-facing curved dark glass */}
        <mesh position={[0, 0.02, 0.18]} rotation={[0.1, 0, 0]}>
          <sphereGeometry args={[0.22, 20, 16, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.3, Math.PI * 0.5]} />
          <meshStandardMaterial
            color={VISOR_DARK}
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={2.2}
          />
        </mesh>
        {/* Visor gold tint highlight strip */}
        <mesh position={[0, 0.06, 0.32]} rotation={[0.05, 0, 0]}>
          <planeGeometry args={[0.32, 0.08]} />
          <meshStandardMaterial
            color={VISOR_GOLD}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.55}
            emissive={VISOR_GOLD}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Helmet ring at the neck */}
        <mesh position={[0, -0.28, 0]}>
          <torusGeometry args={[0.28, 0.04, 8, 24]} />
          <meshStandardMaterial color={SUIT_TRIM} metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Antenna */}
        <mesh position={[0.18, 0.28, -0.05]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.012, 0.012, 0.28, 6]} />
          <meshStandardMaterial color={SUIT_TRIM} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0.24, 0.41, -0.05]}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshBasicMaterial color={ACCENT_RED} toneMapped={false} />
        </mesh>
      </group>

      {/* ── Name patch on chest (decorative) ─────────────── */}
      <mesh position={[0.18, 1.5, 0.36]}>
        <planeGeometry args={[0.12, 0.06]} />
        <meshStandardMaterial color={ACCENT_RED} />
      </mesh>
    </group>
  );
}
