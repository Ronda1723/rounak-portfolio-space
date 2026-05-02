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
    floor: "#a87858",
    wall: "#d8b896",
    ceiling: "#f0e2cc",
    trim: "#8a5a3a",
    accent: "#ff8c4a",
    ambient: 0.5,
    ambientColor: "#ffd8b0",
    lightColor: "#ffc89a",
    lightIntensity: 1.2,
  },
  industrial: {
    floor: "#3a4048",
    wall: "#e0e4ea",
    ceiling: "#f4f6f9",
    trim: "#7a838c",
    accent: "#5BC0EB",
    ambient: 0.55,
    ambientColor: "#dde8f4",
    lightColor: "#ffffff",
    lightIntensity: 1.3,
  },
  stone: {
    floor: "#5a544c",
    wall: "#e8dcc4",
    ceiling: "#f4ecd8",
    trim: "#9a8a6a",
    accent: "#e6c98a",
    ambient: 0.5,
    ambientColor: "#f4dcb0",
    lightColor: "#fff0d0",
    lightIntensity: 1.25,
  },
  verdant: {
    floor: "#5a6a52",
    wall: "#f4f8ec",
    ceiling: "#fafff0",
    trim: "#8aa57a",
    accent: "#7AFFAD",
    ambient: 0.6,
    ambientColor: "#e8f4dc",
    lightColor: "#ffffff",
    lightIntensity: 1.4,
  },
};

export const ROOM_ORIGIN: [number, number, number] = [1000, 0, 0];
export const ROOM_INTERIOR_Y = 1.5;

const ROOM_W = 24;
const ROOM_D = 24;
const ROOM_H = 6.5;

// Stones live on a circle of this radius around the room center.
export const STONE_RADIUS = 7.0;
// Astronaut walks to this radius (closer to center than the stone).
export const ASTRONAUT_VIEW_RADIUS = 5.2;

export function stoneLayoutAngle(index: number, total: number) {
  return (index / total) * Math.PI * 2 + Math.PI / 4;
}

type Props = {
  planet: Planet;
};

export function Room({ planet }: Props) {
  const theme = THEMES[planet.terrainTheme] ?? THEMES.stone;

  const artifactCount = planet.artifacts.length;
  const stonePositions: [number, number, number][] = [];
  for (let i = 0; i < artifactCount; i++) {
    const angle = stoneLayoutAngle(i, artifactCount);
    stonePositions.push([
      Math.cos(angle) * STONE_RADIUS,
      0,
      Math.sin(angle) * STONE_RADIUS,
    ]);
  }

  return (
    <group position={ROOM_ORIGIN}>
      {/* ── Floor ─────────────────────────────────────────────── */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial
          color={theme.floor}
          metalness={0.2}
          roughness={0.65}
        />
      </mesh>

      {/* Subtle inlay disc at the center of the floor */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.4, 64]} />
        <meshStandardMaterial
          color={theme.trim}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>

      {/* ── Ceiling ──────────────────────────────────────────── */}
      <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial
          color={theme.ceiling}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Slim skylight strip down the middle of the ceiling */}
      <mesh position={[0, ROOM_H - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, ROOM_D - 6]} />
        <meshBasicMaterial color={theme.lightColor} toneMapped={false} />
      </mesh>

      {/* ── 4 Walls ──────────────────────────────────────────── */}
      <mesh position={[0, ROOM_H / 2, -ROOM_D / 2]}>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial
          color={theme.wall}
          metalness={0.05}
          roughness={0.8}
          side={2}
        />
      </mesh>
      <mesh position={[0, ROOM_H / 2, ROOM_D / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial
          color={theme.wall}
          metalness={0.05}
          roughness={0.8}
          side={2}
        />
      </mesh>
      <mesh position={[-ROOM_W / 2, ROOM_H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_D, ROOM_H]} />
        <meshStandardMaterial
          color={theme.wall}
          metalness={0.05}
          roughness={0.8}
          side={2}
        />
      </mesh>
      <mesh position={[ROOM_W / 2, ROOM_H / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_D, ROOM_H]} />
        <meshStandardMaterial
          color={theme.wall}
          metalness={0.05}
          roughness={0.8}
          side={2}
        />
      </mesh>

      {/* Single skirting trim around the floor (cleaner than full borders) */}
      {[-1, 1].map((sx) => (
        <mesh key={`xtrim-${sx}`} position={[sx * (ROOM_W / 2 - 0.04), 0.18, 0]}>
          <boxGeometry args={[0.06, 0.36, ROOM_D]} />
          <meshStandardMaterial
            color={theme.trim}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}
      {[-1, 1].map((sz) => (
        <mesh key={`ztrim-${sz}`} position={[0, 0.18, sz * (ROOM_D / 2 - 0.04)]}>
          <boxGeometry args={[ROOM_W, 0.36, 0.06]} />
          <meshStandardMaterial
            color={theme.trim}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Title plate on the back wall — single elegant slab */}
      <mesh position={[0, ROOM_H * 0.62, -ROOM_D / 2 + 0.05]}>
        <planeGeometry args={[7, 1.0]} />
        <meshStandardMaterial
          color="#0e1320"
          metalness={0.5}
          roughness={0.45}
          emissive={theme.accent}
          emissiveIntensity={0.18}
        />
      </mesh>

      {/* ── Lighting ──────────────────────────────────────────── */}
      <ambientLight intensity={theme.ambient} color={theme.ambientColor} />
      {/* Main overhead — bright, soft */}
      <pointLight
        position={[0, ROOM_H - 0.4, 0]}
        color={theme.lightColor}
        intensity={theme.lightIntensity * 30}
        distance={28}
        decay={1.6}
      />
      {/* Spotlights aimed at each pedestal */}
      {stonePositions.map((p, i) => (
        <spotLight
          key={`spot-${i}`}
          position={[p[0] * 0.55, ROOM_H - 0.2, p[2] * 0.55]}
          target-position={[p[0], 1, p[2]]}
          color={theme.lightColor}
          intensity={6}
          angle={0.45}
          penumbra={0.6}
          distance={ROOM_H * 2}
          decay={1.8}
        />
      ))}
      {/* Soft accent lights at the corners */}
      {[
        [-ROOM_W / 2 + 1.5, 0.6, -ROOM_D / 2 + 1.5],
        [ROOM_W / 2 - 1.5, 0.6, -ROOM_D / 2 + 1.5],
        [-ROOM_W / 2 + 1.5, 0.6, ROOM_D / 2 - 1.5],
        [ROOM_W / 2 - 1.5, 0.6, ROOM_D / 2 - 1.5],
      ].map((pos, i) => (
        <pointLight
          key={`corner-${i}`}
          position={pos as [number, number, number]}
          color={theme.accent}
          intensity={2.5}
          distance={5}
          decay={2}
        />
      ))}

      {/* ── Artifact stones ──────────────────────────────────── */}
      {planet.artifacts.map((a, i) => (
        <Stone key={a.id} artifact={a} position={stonePositions[i]} />
      ))}

      {/* ── The astronaut (walks toward whichever stone is active) ── */}
      <Astronaut planet={planet} />
    </group>
  );
}
