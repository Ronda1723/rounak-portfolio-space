import type { Planet } from "../config/planets";
import { Stone } from "./Stone";
import { Astronaut } from "./Astronaut";

type Theme = {
  floor: string;
  wall: string;
  ceiling: string;
  trim: string;
  accent: string;
  ambient: number;
  ambientColor: string;
  lightColor: string;
  lightIntensity: number;
};

const THEMES: Record<string, Theme> = {
  desert: {
    floor: "#9c5a32",
    wall: "#c47750",
    ceiling: "#7a4525",
    trim: "#5a3018",
    accent: "#ff8c4a",
    ambient: 0.35,
    ambientColor: "#ffb37a",
    lightColor: "#ffb070",
    lightIntensity: 1.4,
  },
  industrial: {
    floor: "#2a2f36",
    wall: "#3a424a",
    ceiling: "#1f242a",
    trim: "#9aa3aa",
    accent: "#5BC0EB",
    ambient: 0.3,
    ambientColor: "#a8c8e8",
    lightColor: "#9ec8f0",
    lightIntensity: 1.2,
  },
  stone: {
    floor: "#4a4540",
    wall: "#7a7068",
    ceiling: "#3a3530",
    trim: "#d4c084",
    accent: "#e6c98a",
    ambient: 0.32,
    ambientColor: "#f4dcb0",
    lightColor: "#f4d8a0",
    lightIntensity: 1.3,
  },
  verdant: {
    floor: "#3a4a32",
    wall: "#dde6dc",
    ceiling: "#f0f4ec",
    trim: "#5a7a4a",
    accent: "#7AFFAD",
    ambient: 0.4,
    ambientColor: "#d4f0d4",
    lightColor: "#f4ffe8",
    lightIntensity: 1.5,
  },
};

export const ROOM_ORIGIN: [number, number, number] = [1000, 0, 0];
export const ROOM_INTERIOR_Y = 1.5;

const ROOM_W = 14;
const ROOM_D = 14;
const ROOM_H = 5;

type Props = {
  planet: Planet;
};

export function Room({ planet }: Props) {
  const theme = THEMES[planet.terrainTheme] ?? THEMES.stone;

  // Stone positions: arrange around the room perimeter, evenly spaced
  // Each artifact gets a corner / cardinal slot
  const artifactCount = planet.artifacts.length;
  const stonePositions: [number, number, number][] = [];
  for (let i = 0; i < artifactCount; i++) {
    const angle = (i / artifactCount) * Math.PI * 2 + Math.PI / 4;
    const r = 4.6;
    stonePositions.push([
      Math.cos(angle) * r,
      0,
      Math.sin(angle) * r,
    ]);
  }

  return (
    <group position={ROOM_ORIGIN}>
      {/* ── Floor ────────────────────────────────────────────── */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial
          color={theme.floor}
          metalness={0.15}
          roughness={0.8}
        />
      </mesh>

      {/* Center floor accent ring (echoes the dock ring aesthetic) */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.4, 64]} />
        <meshStandardMaterial
          color={theme.accent}
          emissive={theme.accent}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* ── Ceiling ───────────────────────────────────────────── */}
      <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial
          color={theme.ceiling}
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>

      {/* Skylight panel in the ceiling */}
      <mesh position={[0, ROOM_H - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          color={theme.lightColor}
          toneMapped={false}
        />
      </mesh>

      {/* ── 4 Walls (back, front, left, right) ────────────────── */}
      {/* Back wall (-Z) */}
      <mesh position={[0, ROOM_H / 2, -ROOM_D / 2]}>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial
          color={theme.wall}
          metalness={0.1}
          roughness={0.7}
          side={2}
        />
      </mesh>
      {/* Front wall (+Z) */}
      <mesh position={[0, ROOM_H / 2, ROOM_D / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial
          color={theme.wall}
          metalness={0.1}
          roughness={0.7}
          side={2}
        />
      </mesh>
      {/* Left wall (-X) */}
      <mesh position={[-ROOM_W / 2, ROOM_H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_D, ROOM_H]} />
        <meshStandardMaterial
          color={theme.wall}
          metalness={0.1}
          roughness={0.7}
          side={2}
        />
      </mesh>
      {/* Right wall (+X) */}
      <mesh position={[ROOM_W / 2, ROOM_H / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_D, ROOM_H]} />
        <meshStandardMaterial
          color={theme.wall}
          metalness={0.1}
          roughness={0.7}
          side={2}
        />
      </mesh>

      {/* ── Wall trim — accent strip running around ───────────── */}
      {[-1, 1].map((sx) => (
        <mesh key={`xtrim-${sx}`} position={[sx * (ROOM_W / 2 - 0.02), 0.6, 0]}>
          <boxGeometry args={[0.04, 0.08, ROOM_D]} />
          <meshStandardMaterial
            color={theme.trim}
            metalness={0.6}
            roughness={0.4}
            emissive={theme.accent}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
      {[-1, 1].map((sz) => (
        <mesh key={`ztrim-${sz}`} position={[0, 0.6, sz * (ROOM_D / 2 - 0.02)]}>
          <boxGeometry args={[ROOM_W, 0.08, 0.04]} />
          <meshStandardMaterial
            color={theme.trim}
            metalness={0.6}
            roughness={0.4}
            emissive={theme.accent}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}

      {/* Title plaque on the back wall */}
      <mesh position={[0, ROOM_H - 1.0, -ROOM_D / 2 + 0.05]}>
        <planeGeometry args={[6, 0.6]} />
        <meshStandardMaterial
          color="#0e1320"
          emissive={theme.accent}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* ── Lighting ──────────────────────────────────────────── */}
      <ambientLight intensity={theme.ambient} color={theme.ambientColor} />
      <pointLight
        position={[0, ROOM_H - 0.3, 0]}
        color={theme.lightColor}
        intensity={theme.lightIntensity * 18}
        distance={20}
        decay={1.6}
      />
      {/* Corner accent lights for atmosphere */}
      {[
        [-ROOM_W / 2 + 1, ROOM_H - 0.5, -ROOM_D / 2 + 1],
        [ROOM_W / 2 - 1, ROOM_H - 0.5, -ROOM_D / 2 + 1],
        [-ROOM_W / 2 + 1, ROOM_H - 0.5, ROOM_D / 2 - 1],
        [ROOM_W / 2 - 1, ROOM_H - 0.5, ROOM_D / 2 - 1],
      ].map((pos, i) => (
        <pointLight
          key={`corner-${i}`}
          position={pos as [number, number, number]}
          color={theme.accent}
          intensity={4}
          distance={6}
          decay={2}
        />
      ))}

      {/* ── Artifacts (Phase D) ───────────────────────────────── */}
      {planet.artifacts.map((a, i) => (
        <Stone key={a.id} artifact={a} position={stonePositions[i]} />
      ))}

      {/* ── The astronaut (Phase E) ───────────────────────────── */}
      <Astronaut position={[0, 0, 1.2]} />
    </group>
  );
}
