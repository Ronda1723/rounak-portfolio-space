import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import type { Planet } from "../config/planets";
import { useGameStore } from "../state/useGameStore";
import {
  ASTRONAUT_VIEW_RADIUS,
  ROOM_ORIGIN,
  WALK_HALF_D,
  WALK_HALF_W,
  stoneLayoutAngle,
} from "./Room";
import { astronautTracker } from "./astronautTracker";

// EVA suit palette
const SUIT = "#f4f5f7";
const SUIT_SHADOW = "#d8dde2";
const JOINT = "#2a2f36";
const RUBBER = "#1a1d22";
const VISOR = "#08111c";
const VISOR_GOLD = "#d4a14a";
const RED = "#d94432";
const BLUE = "#3a5fd8";
const GOLD_TRIM = "#c9a55c";

const HOME_POS = new Vector3(0, 0, 0);
const tmpTarget = new Vector3();
const tmpDir = new Vector3();

const WALK_SPEED = 2.6;
const TURN_SPEED = 2.2;
const AUTO_WALK_SPEED = 2.4;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

type Props = {
  planet: Planet;
};

export function Astronaut({ planet }: Props) {
  const root = useRef<Group>(null);
  const head = useRef<Group>(null);

  // Limb groups — pivots are placed at the joint
  const upperArmL = useRef<Group>(null);
  const upperArmR = useRef<Group>(null);
  const forearmL = useRef<Group>(null);
  const forearmR = useRef<Group>(null);
  const thighL = useRef<Group>(null);
  const thighR = useRef<Group>(null);
  const shinL = useRef<Group>(null);
  const shinR = useRef<Group>(null);

  const walkPhase = useRef(0);
  const walkSpeed = useRef(0);

  const manualMode = useRef(false);
  const keys = useRef<Record<string, boolean>>({});

  const mode = useGameStore((s) => s.mode);
  const activeArtifact = useGameStore((s) => s.activeArtifact);

  useEffect(() => {
    manualMode.current = false;
  }, [activeArtifact?.id]);

  useEffect(() => {
    if (mode !== "exploring") return;
    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "a" || k === "s" || k === "d") keys.current[k] = true;
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "a" || k === "s" || k === "d") keys.current[k] = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      keys.current = {};
    };
  }, [mode]);

  useFrame((_, dt) => {
    if (!root.current) return;
    const t = performance.now() * 0.001;

    const k = keys.current;
    const fwdInput = (k.w ? 1 : 0) - (k.s ? 1 : 0);
    const turnInput = (k.a ? 1 : 0) - (k.d ? 1 : 0);
    const hasManualInput = fwdInput !== 0 || turnInput !== 0;

    let isWalking = false;

    if (hasManualInput && mode === "exploring") {
      manualMode.current = true;
      root.current.rotation.y += turnInput * TURN_SPEED * dt;
      if (fwdInput !== 0) {
        const yaw = root.current.rotation.y;
        const step = fwdInput * WALK_SPEED * dt;
        const nx = root.current.position.x + Math.sin(yaw) * step;
        const nz = root.current.position.z + Math.cos(yaw) * step;
        root.current.position.x = clamp(nx, -WALK_HALF_W, WALK_HALF_W);
        root.current.position.z = clamp(nz, -WALK_HALF_D, WALK_HALF_D);
        isWalking = true;
      }
    } else if (!manualMode.current && activeArtifact) {
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
      tmpDir.subVectors(tmpTarget, root.current.position);
      tmpDir.y = 0;
      const dist = tmpDir.length();
      if (dist > 0.06) {
        const stepLen = Math.min(dist, AUTO_WALK_SPEED * dt);
        tmpDir.normalize().multiplyScalar(stepLen);
        root.current.position.add(tmpDir);
        const targetYaw = Math.atan2(tmpDir.x, tmpDir.z);
        let dy = targetYaw - root.current.rotation.y;
        dy = ((dy + Math.PI) % (Math.PI * 2)) - Math.PI;
        root.current.rotation.y += dy * Math.min(1, dt * 8);
        isWalking = true;
      }
    }

    if (isWalking) {
      walkSpeed.current = Math.min(1, walkSpeed.current + dt * 6);
      walkPhase.current += dt * 7.0;
    } else {
      walkSpeed.current = Math.max(0, walkSpeed.current - dt * 5);
    }

    // ── Body bob ─────────────────────────────────────────────
    const breathe = Math.sin(t * 1.2) * 0.022;
    const walkBob =
      Math.abs(Math.sin(walkPhase.current * 2)) * 0.05 * walkSpeed.current;
    root.current.position.y = breathe + walkBob;

    // ── Two-segment limb swing for a real walk ───────────────
    const swing = Math.sin(walkPhase.current);
    const swingShifted = Math.sin(walkPhase.current + Math.PI * 0.5);
    const ws = walkSpeed.current;

    // Hips swing back/forth; knees bend on the forward swing
    const hipSwing = swing * 0.6 * ws;
    const kneeBend = Math.max(0, swingShifted) * 0.8 * ws + 0.05 * ws;
    // Shoulders counter-rotate; elbows bend a bit
    const shoulderSwing = -swing * 0.45 * ws;
    const elbowBend = 0.25 + Math.max(0, -swingShifted) * 0.45 * ws;

    if (thighL.current) thighL.current.rotation.x = hipSwing;
    if (thighR.current) thighR.current.rotation.x = -hipSwing;
    if (shinL.current) shinL.current.rotation.x = -kneeBend * (swing > 0 ? 1 : 0.2);
    if (shinR.current) shinR.current.rotation.x = -kneeBend * (swing < 0 ? 1 : 0.2);

    if (upperArmL.current)
      upperArmL.current.rotation.x =
        shoulderSwing + Math.sin(t * 0.8) * 0.04 * (1 - ws);
    if (upperArmR.current)
      upperArmR.current.rotation.x =
        -shoulderSwing - Math.sin(t * 0.8) * 0.04 * (1 - ws);
    if (forearmL.current) forearmL.current.rotation.x = -elbowBend;
    if (forearmR.current) forearmR.current.rotation.x = -elbowBend;

    if (head.current)
      head.current.rotation.y = Math.sin(t * 0.4) * 0.1 * (1 - ws);

    astronautTracker.position.set(
      ROOM_ORIGIN[0] + root.current.position.x,
      ROOM_ORIGIN[1] + root.current.position.y,
      ROOM_ORIGIN[2] + root.current.position.z
    );
    astronautTracker.yaw = root.current.rotation.y;
  });

  return (
    <group ref={root}>
      {/* ──────────── LEGS (thigh → knee → shin → boot) ──────────── */}
      {([
        ["L", -1, thighL, shinL],
        ["R", 1, thighR, shinR],
      ] as const).map(([id, s, thighRef, shinRef]) => (
        <group key={`leg-${id}`} ref={thighRef} position={[s * 0.18, 0.95, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.135, 0.4, 8, 16]} />
            <meshStandardMaterial color={SUIT} metalness={0.18} roughness={0.5} />
          </mesh>
          {/* Knee joint */}
          <mesh position={[0, -0.46, 0]}>
            <torusGeometry args={[0.13, 0.04, 10, 20]} />
            <meshStandardMaterial color={JOINT} metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Suit fabric ribbing along thigh */}
          {[-0.36, -0.28, -0.2, -0.12].map((y, i) => (
            <mesh key={`thigh-rib-${i}`} position={[0, y, 0]}>
              <torusGeometry args={[0.138, 0.012, 6, 18]} />
              <meshStandardMaterial color={SUIT_SHADOW} metalness={0.15} roughness={0.55} />
            </mesh>
          ))}

          {/* Shin (pivots from knee) */}
          <group ref={shinRef} position={[0, -0.46, 0]}>
            <mesh position={[0, -0.22, 0]} castShadow>
              <capsuleGeometry args={[0.13, 0.36, 8, 16]} />
              <meshStandardMaterial color={SUIT} metalness={0.18} roughness={0.5} />
            </mesh>
            {/* Shin ribs */}
            {[-0.3, -0.22, -0.14].map((y, i) => (
              <mesh key={`shin-rib-${i}`} position={[0, y, 0]}>
                <torusGeometry args={[0.133, 0.012, 6, 18]} />
                <meshStandardMaterial
                  color={SUIT_SHADOW}
                  metalness={0.15}
                  roughness={0.55}
                />
              </mesh>
            ))}
            {/* Boot — sole + upper */}
            <mesh position={[0, -0.46, 0.06]} castShadow>
              <boxGeometry args={[0.24, 0.12, 0.4]} />
              <meshStandardMaterial color={RUBBER} metalness={0.3} roughness={0.65} />
            </mesh>
            <mesh position={[0, -0.39, 0.06]} castShadow>
              <boxGeometry args={[0.22, 0.06, 0.36]} />
              <meshStandardMaterial color={JOINT} metalness={0.5} roughness={0.5} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ──────────── HIPS / WAIST ──────────── */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.18, 24]} />
        <meshStandardMaterial color={JOINT} metalness={0.55} roughness={0.45} />
      </mesh>
      {/* Hip ring detail */}
      <mesh position={[0, 0.87, 0]}>
        <torusGeometry args={[0.36, 0.025, 10, 28]} />
        <meshStandardMaterial color={GOLD_TRIM} metalness={0.85} roughness={0.25} />
      </mesh>

      {/* ──────────── TORSO (HUT — Hard Upper Torso) ──────────── */}
      <mesh position={[0, 1.36, 0]} castShadow>
        <capsuleGeometry args={[0.4, 0.55, 8, 20]} />
        <meshStandardMaterial color={SUIT} metalness={0.2} roughness={0.45} />
      </mesh>

      {/* Chest control panel (DCM — Display & Control Module) */}
      <mesh position={[0, 1.42, 0.38]} castShadow>
        <boxGeometry args={[0.46, 0.32, 0.05]} />
        <meshStandardMaterial color="#0e1320" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.42, 0.41]}>
        <boxGeometry args={[0.42, 0.28, 0.005]} />
        <meshStandardMaterial
          color="#1a3050"
          emissive="#5BC0EB"
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Status LEDs */}
      {[RED, "#7AFFAD", "#5BC0EB", GOLD_TRIM].map((c, i) => (
        <mesh key={`led-${i}`} position={[-0.15 + i * 0.1, 1.5, 0.42]}>
          <sphereGeometry args={[0.018, 10, 8]} />
          <meshBasicMaterial color={c} toneMapped={false} />
        </mesh>
      ))}
      {/* Switches row */}
      {[0, 1, 2].map((i) => (
        <mesh key={`switch-${i}`} position={[-0.12 + i * 0.12, 1.36, 0.42]}>
          <cylinderGeometry args={[0.012, 0.012, 0.025, 8]} />
          <meshStandardMaterial color={JOINT} metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* US flag patch on left shoulder */}
      <mesh position={[-0.34, 1.55, 0.28]} rotation={[0, -0.5, 0]}>
        <planeGeometry args={[0.14, 0.09]} />
        <meshStandardMaterial color={SUIT} metalness={0.05} roughness={0.7} />
      </mesh>
      <mesh position={[-0.34, 1.555, 0.28]} rotation={[0, -0.5, 0]}>
        <planeGeometry args={[0.06, 0.045]} />
        <meshStandardMaterial color={BLUE} metalness={0.05} roughness={0.7} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={`stripe-${i}`}
          position={[-0.34 + 0.001, 1.575 - i * 0.012, 0.28]}
          rotation={[0, -0.5, 0]}
        >
          <planeGeometry args={[0.075, 0.006]} />
          <meshStandardMaterial color={i % 2 === 0 ? RED : SUIT} metalness={0.05} roughness={0.7} />
        </mesh>
      ))}

      {/* Mission patch on right shoulder (circular emblem) */}
      <mesh position={[0.34, 1.52, 0.28]} rotation={[0, 0.5, 0]}>
        <circleGeometry args={[0.07, 24]} />
        <meshStandardMaterial color="#1a3050" metalness={0.1} roughness={0.65} />
      </mesh>
      <mesh position={[0.34, 1.52, 0.282]} rotation={[0, 0.5, 0]}>
        <circleGeometry args={[0.055, 24]} />
        <meshStandardMaterial color={GOLD_TRIM} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.34, 1.52, 0.284]} rotation={[0, 0.5, 0]}>
        <ringGeometry args={[0.057, 0.062, 32]} />
        <meshStandardMaterial color={RED} metalness={0.1} roughness={0.7} />
      </mesh>

      {/* Name patch */}
      <mesh position={[0.16, 1.18, 0.39]}>
        <planeGeometry args={[0.18, 0.05]} />
        <meshStandardMaterial color={RED} metalness={0.05} roughness={0.7} />
      </mesh>

      {/* Shoulder caps (rigid) */}
      {[-1, 1].map((s) => (
        <mesh key={`shoulder-${s}`} position={[s * 0.42, 1.62, 0]} castShadow>
          <sphereGeometry args={[0.18, 18, 14]} />
          <meshStandardMaterial color={SUIT} metalness={0.2} roughness={0.45} />
        </mesh>
      ))}

      {/* PLSS (life-support backpack) */}
      <group position={[0, 1.36, -0.36]}>
        <mesh castShadow>
          <boxGeometry args={[0.62, 0.78, 0.32]} />
          <meshStandardMaterial color={SUIT} metalness={0.18} roughness={0.45} />
        </mesh>
        {/* PLSS panel inset */}
        <mesh position={[0, 0.05, -0.165]}>
          <boxGeometry args={[0.5, 0.5, 0.01]} />
          <meshStandardMaterial color={JOINT} metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Vents */}
        {[-0.18, 0, 0.18].map((x, i) => (
          <mesh key={`vent-${i}`} position={[x, -0.35, 0]}>
            <boxGeometry args={[0.06, 0.04, 0.32]} />
            <meshStandardMaterial color={JOINT} metalness={0.6} roughness={0.5} />
          </mesh>
        ))}
        {/* Antenna */}
        <mesh position={[0.22, 0.45, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.32, 6]} />
          <meshStandardMaterial color={JOINT} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0.22, 0.62, 0]}>
          <sphereGeometry args={[0.018, 8, 6]} />
          <meshBasicMaterial color={RED} toneMapped={false} />
        </mesh>
      </group>

      {/* Hose connecting PLSS to chest */}
      <mesh position={[0, 1.55, -0.05]} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[0.06, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color={JOINT} metalness={0.4} roughness={0.6} />
      </mesh>

      {/* ──────────── ARMS (upper arm → elbow → forearm → glove) ──────────── */}
      {([
        ["L", -1, upperArmL, forearmL],
        ["R", 1, upperArmR, forearmR],
      ] as const).map(([id, s, upperRef, foreRef]) => (
        <group
          key={`arm-${id}`}
          ref={upperRef}
          position={[s * 0.46, 1.62, 0]}
        >
          {/* Upper arm */}
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.115, 0.32, 8, 14]} />
            <meshStandardMaterial color={SUIT} metalness={0.18} roughness={0.5} />
          </mesh>
          {/* Upper arm ribs */}
          {[-0.06, -0.16, -0.26].map((y, i) => (
            <mesh key={`uarm-rib-${id}-${i}`} position={[0, y, 0]}>
              <torusGeometry args={[0.118, 0.01, 6, 16]} />
              <meshStandardMaterial color={SUIT_SHADOW} metalness={0.15} roughness={0.55} />
            </mesh>
          ))}
          {/* Elbow joint */}
          <mesh position={[0, -0.36, 0]}>
            <torusGeometry args={[0.11, 0.035, 10, 20]} />
            <meshStandardMaterial color={JOINT} metalness={0.7} roughness={0.4} />
          </mesh>

          {/* Forearm (pivots from elbow) */}
          <group ref={foreRef} position={[0, -0.36, 0]}>
            <mesh position={[0, -0.18, 0]} castShadow>
              <capsuleGeometry args={[0.105, 0.3, 8, 14]} />
              <meshStandardMaterial color={SUIT} metalness={0.18} roughness={0.5} />
            </mesh>
            {/* Forearm ribs */}
            {[-0.06, -0.16, -0.26].map((y, i) => (
              <mesh key={`farm-rib-${id}-${i}`} position={[0, y, 0]}>
                <torusGeometry args={[0.108, 0.009, 6, 16]} />
                <meshStandardMaterial color={SUIT_SHADOW} metalness={0.15} roughness={0.55} />
              </mesh>
            ))}
            {/* Wrist cuff */}
            <mesh position={[0, -0.34, 0]}>
              <torusGeometry args={[0.105, 0.022, 10, 20]} />
              <meshStandardMaterial color={JOINT} metalness={0.7} roughness={0.4} />
            </mesh>
            {/* Glove */}
            <mesh position={[0, -0.43, 0.02]} castShadow>
              <sphereGeometry args={[0.115, 16, 12]} />
              <meshStandardMaterial color={JOINT} metalness={0.4} roughness={0.55} />
            </mesh>
          </group>
        </group>
      ))}

      {/* ──────────── HELMET ──────────── */}
      <group ref={head} position={[0, 1.95, 0]}>
        {/* Helmet shell — slightly tapered */}
        <mesh castShadow>
          <sphereGeometry args={[0.34, 32, 24]} />
          <meshStandardMaterial color={SUIT} metalness={0.25} roughness={0.35} />
        </mesh>
        {/* Visor — wide curved gold-tinted face shield */}
        <mesh position={[0, 0.0, 0.02]}>
          <sphereGeometry
            args={[0.348, 32, 24, Math.PI * 0.2, Math.PI * 0.6, Math.PI * 0.32, Math.PI * 0.42]}
          />
          <meshStandardMaterial
            color={VISOR}
            metalness={0.95}
            roughness={0.04}
            envMapIntensity={2.5}
          />
        </mesh>
        {/* Gold visor coating overlay */}
        <mesh position={[0, 0.0, 0.025]}>
          <sphereGeometry
            args={[0.349, 32, 24, Math.PI * 0.22, Math.PI * 0.56, Math.PI * 0.34, Math.PI * 0.28]}
          />
          <meshStandardMaterial
            color={VISOR_GOLD}
            metalness={0.95}
            roughness={0.06}
            transparent
            opacity={0.55}
            envMapIntensity={3.5}
            emissive={VISOR_GOLD}
            emissiveIntensity={0.18}
          />
        </mesh>
        {/* Visor frame */}
        <mesh position={[0, 0.0, 0.03]}>
          <torusGeometry args={[0.27, 0.012, 10, 32, Math.PI * 1.1]} />
          <meshStandardMaterial color={JOINT} metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Neck ring (helmet locks to suit here) */}
        <mesh position={[0, -0.32, 0]}>
          <torusGeometry args={[0.3, 0.04, 12, 28]} />
          <meshStandardMaterial color={GOLD_TRIM} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 28]} />
          <meshStandardMaterial color={JOINT} metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Side cameras / lights */}
        {[-1, 1].map((s) => (
          <group key={`hsl-${s}`} position={[s * 0.3, 0.05, 0.05]}>
            <mesh>
              <boxGeometry args={[0.05, 0.06, 0.06]} />
              <meshStandardMaterial color={JOINT} metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[s * 0.026, 0, 0]}>
              <sphereGeometry args={[0.018, 10, 8]} />
              <meshBasicMaterial color="#fff8d8" toneMapped={false} />
            </mesh>
          </group>
        ))}
        {/* Antenna */}
        <mesh position={[0.22, 0.26, -0.06]} rotation={[0, 0, 0.35]}>
          <cylinderGeometry args={[0.008, 0.008, 0.3, 6]} />
          <meshStandardMaterial color={JOINT} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0.27, 0.4, -0.06]}>
          <sphereGeometry args={[0.018, 10, 8]} />
          <meshBasicMaterial color={RED} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
