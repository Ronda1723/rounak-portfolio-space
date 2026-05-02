import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import type { Planet } from "../config/planets";
import { useGameStore } from "../state/useGameStore";
import { ASTRONAUT_VIEW_RADIUS, ROOM_ORIGIN, stoneLayoutAngle } from "./Room";
import { astronautTracker } from "./astronautTracker";

const SUIT_WHITE = "#eef0f3";
const SUIT_TRIM = "#3a4148";
const VISOR_DARK = "#0a0e16";
const VISOR_GOLD = "#a87a2a";
const ACCENT_RED = "#d94432";

const HOME_POS = new Vector3(0, 0, 0);
const tmpTarget = new Vector3();
const tmpDir = new Vector3();

type Props = {
  planet: Planet;
};

export function Astronaut({ planet }: Props) {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);

  // Walking state — driven from the store: when an artifact becomes active,
  // we walk to a viewing slot in front of its stone. When it clears, we walk
  // back home.
  const walkPhase = useRef(0); // 0..2π for leg cycle
  const walkSpeed = useRef(0); // 0 = idle, 1 = full stride

  const activeArtifact = useGameStore((s) => s.activeArtifact);

  useFrame((_, dt) => {
    if (!root.current) return;
    const t = performance.now() * 0.001;

    // ── Compute target ────────────────────────────────────────
    if (activeArtifact) {
      const i = planet.artifacts.findIndex((a) => a.id === activeArtifact.id);
      if (i >= 0) {
        const angle = stoneLayoutAngle(i, planet.artifacts.length);
        tmpTarget.set(
          Math.cos(angle) * ASTRONAUT_VIEW_RADIUS,
          0,
          Math.sin(angle) * ASTRONAUT_VIEW_RADIUS
        );
      } else {
        tmpTarget.copy(HOME_POS);
      }
    } else {
      tmpTarget.copy(HOME_POS);
    }

    // ── Walk toward target ────────────────────────────────────
    tmpDir.subVectors(tmpTarget, root.current.position);
    tmpDir.y = 0;
    const dist = tmpDir.length();

    const isWalking = dist > 0.06;
    if (isWalking) {
      // Move at ~2.4 units/sec, easing as we approach
      const stepLen = Math.min(dist, 2.4 * dt);
      tmpDir.normalize().multiplyScalar(stepLen);
      root.current.position.add(tmpDir);

      // Face direction of travel — smooth yaw
      const targetYaw = Math.atan2(tmpDir.x, tmpDir.z);
      let dy = targetYaw - root.current.rotation.y;
      dy = ((dy + Math.PI) % (Math.PI * 2)) - Math.PI;
      root.current.rotation.y += dy * Math.min(1, dt * 8);

      walkSpeed.current = Math.min(1, walkSpeed.current + dt * 6);
      walkPhase.current += dt * 7.5; // stride frequency
    } else {
      walkSpeed.current = Math.max(0, walkSpeed.current - dt * 5);
    }

    // ── Body bob (breathing + walking pulse) ─────────────────
    const breathe = Math.sin(t * 1.2) * 0.025;
    const walkBob = Math.abs(Math.sin(walkPhase.current * 2)) * 0.05 * walkSpeed.current;
    root.current.position.y = breathe + walkBob;

    // ── Limb swing ───────────────────────────────────────────
    const swing = Math.sin(walkPhase.current);
    const armSwing = swing * 0.5 * walkSpeed.current;
    const legSwing = swing * 0.6 * walkSpeed.current;

    if (armL.current) {
      armL.current.rotation.x = -armSwing + Math.sin(t * 0.8) * 0.06 * (1 - walkSpeed.current);
    }
    if (armR.current) {
      armR.current.rotation.x = armSwing - Math.sin(t * 0.8) * 0.06 * (1 - walkSpeed.current);
    }
    if (legL.current) {
      legL.current.rotation.x = legSwing;
    }
    if (legR.current) {
      legR.current.rotation.x = -legSwing;
    }

    // Subtle head sway when idle
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.4) * 0.15 * (1 - walkSpeed.current);
    }

    // Publish world-space pose for the camera to follow
    astronautTracker.position.set(
      ROOM_ORIGIN[0] + root.current.position.x,
      ROOM_ORIGIN[1] + root.current.position.y,
      ROOM_ORIGIN[2] + root.current.position.z
    );
    astronautTracker.yaw = root.current.rotation.y;
  });

  return (
    <group ref={root}>
      {/* ── Legs (parented to groups so they swing from the hips) ── */}
      {([
        [legL, -1],
        [legR, 1],
      ] as const).map(([ref, s]) => (
        <group key={`leg-${s}`} ref={ref} position={[s * 0.16, 0.95, 0]}>
          <mesh position={[0, -0.4, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.55, 6, 12]} />
            <meshStandardMaterial color={SUIT_WHITE} metalness={0.15} roughness={0.55} />
          </mesh>
          {/* Boot */}
          <mesh position={[0, -0.78, 0.04]} castShadow>
            <boxGeometry args={[0.22, 0.16, 0.34]} />
            <meshStandardMaterial color={SUIT_TRIM} metalness={0.4} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* ── Hip belt ─────────────────────────────────────────── */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.1, 16]} />
        <meshStandardMaterial color={SUIT_TRIM} metalness={0.5} roughness={0.5} />
      </mesh>

      {/* ── Torso ────────────────────────────────────────────── */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <capsuleGeometry args={[0.36, 0.55, 6, 16]} />
        <meshStandardMaterial color={SUIT_WHITE} metalness={0.18} roughness={0.5} />
      </mesh>

      {/* Chest control panel */}
      <mesh position={[0, 1.4, 0.34]} castShadow>
        <boxGeometry args={[0.4, 0.28, 0.06]} />
        <meshStandardMaterial color="#1a1d24" metalness={0.7} roughness={0.4} />
      </mesh>
      {[ACCENT_RED, "#7AFFAD", "#5BC0EB"].map((c, i) => (
        <mesh key={`led-${i}`} position={[-0.1 + i * 0.1, 1.45, 0.38]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshBasicMaterial color={c} toneMapped={false} />
        </mesh>
      ))}

      {/* Backpack */}
      <mesh position={[0, 1.32, -0.36]} castShadow>
        <boxGeometry args={[0.55, 0.65, 0.28]} />
        <meshStandardMaterial color={SUIT_TRIM} metalness={0.55} roughness={0.45} />
      </mesh>

      {/* ── Arms ─────────────────────────────────────────────── */}
      {([
        [armL, -1],
        [armR, 1],
      ] as const).map(([ref, s]) => (
        <group
          key={`arm-${s}`}
          ref={ref}
          position={[s * 0.42, 1.6, 0]}
          rotation={[0, 0, s * 0.05]}
        >
          <mesh position={[0, -0.2, 0]} castShadow>
            <capsuleGeometry args={[0.11, 0.55, 6, 12]} />
            <meshStandardMaterial color={SUIT_WHITE} metalness={0.18} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.6, 0]} castShadow>
            <sphereGeometry args={[0.13, 14, 10]} />
            <meshStandardMaterial color={SUIT_TRIM} metalness={0.4} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <torusGeometry args={[0.13, 0.025, 8, 16]} />
            <meshStandardMaterial color={SUIT_TRIM} metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* ── Helmet ───────────────────────────────────────────── */}
      <group ref={head} position={[0, 1.92, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.32, 24, 20]} />
          <meshStandardMaterial color={SUIT_WHITE} metalness={0.25} roughness={0.4} />
        </mesh>
        <mesh
          position={[0, 0.02, 0.18]}
          rotation={[0.1, 0, 0]}
        >
          <sphereGeometry
            args={[0.22, 20, 16, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.3, Math.PI * 0.5]}
          />
          <meshStandardMaterial
            color={VISOR_DARK}
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={2.2}
          />
        </mesh>
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
        <mesh position={[0, -0.28, 0]}>
          <torusGeometry args={[0.28, 0.04, 8, 24]} />
          <meshStandardMaterial color={SUIT_TRIM} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0.18, 0.28, -0.05]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.012, 0.012, 0.28, 6]} />
          <meshStandardMaterial color={SUIT_TRIM} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0.24, 0.41, -0.05]}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshBasicMaterial color={ACCENT_RED} toneMapped={false} />
        </mesh>
      </group>

      {/* Name patch */}
      <mesh position={[0.18, 1.5, 0.36]}>
        <planeGeometry args={[0.12, 0.06]} />
        <meshStandardMaterial color={ACCENT_RED} />
      </mesh>
    </group>
  );
}
