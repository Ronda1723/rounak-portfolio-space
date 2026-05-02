import { Text } from "@react-three/drei";
import type { Planet } from "../config/planets";
import { Stone } from "./Stone";
import { Astronaut } from "./Astronaut";
import { DustMotes } from "./DustMotes";

type Theme = {
  floor: string;
  wall: string;
  ceiling: string;
  accent: string;
  ambient: number;
  ambientColor: string;
  lightColor: string;
  lightIntensity: number;
  textColor: string;
};

const THEMES: Record<string, Theme> = {
  desert: {
    floor: "#7a5538",
    wall: "#ede2cf",
    ceiling: "#f7eddc",
    accent: "#ff8c4a",
    ambient: 0.55,
    ambientColor: "#ffd8b0",
    lightColor: "#ffd5a8",
    lightIntensity: 1.2,
    textColor: "#1a1410",
  },
  industrial: {
    floor: "#2c333c",
    wall: "#ebeef2",
    ceiling: "#f6f8fb",
    accent: "#5BC0EB",
    ambient: 0.55,
    ambientColor: "#dde8f4",
    lightColor: "#ffffff",
    lightIntensity: 1.4,
    textColor: "#0e1320",
  },
  stone: {
    floor: "#534b40",
    wall: "#efe6d2",
    ceiling: "#f7efdb",
    accent: "#d4b87a",
    ambient: 0.5,
    ambientColor: "#f4dcb0",
    lightColor: "#fff0d0",
    lightIntensity: 1.3,
    textColor: "#1a140a",
  },
  verdant: {
    floor: "#46553e",
    wall: "#f6faf0",
    ceiling: "#fbfff3",
    accent: "#7AFFAD",
    ambient: 0.6,
    ambientColor: "#e8f4dc",
    lightColor: "#ffffff",
    lightIntensity: 1.5,
    textColor: "#0e1a0a",
  },
};

export const ROOM_ORIGIN: [number, number, number] = [1000, 0, 0];
export const ROOM_INTERIOR_Y = 1.5;

const ROOM_W = 24;
const ROOM_D = 24;
const ROOM_H = 6.5;

export const STONE_RADIUS = 7.0;
export const ASTRONAUT_VIEW_RADIUS = 5.2;
export const WALK_HALF_W = ROOM_W / 2 - 1.4;
export const WALK_HALF_D = ROOM_D / 2 - 1.4;

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

  // Each label sits on the wall closest to the stone's outward direction.
  const labelData = stonePositions.map((p, i) => {
    const [x, , z] = p;
    let cx = 0,
      cy = ROOM_H * 0.55,
      cz = 0,
      ry = 0;
    const ax = Math.abs(x);
    const az = Math.abs(z);
    if (az >= ax) {
      cz = z > 0 ? ROOM_D / 2 - 0.04 : -ROOM_D / 2 + 0.04;
      cx = x * 0.55;
      ry = z > 0 ? Math.PI : 0;
    } else {
      cx = x > 0 ? ROOM_W / 2 - 0.04 : -ROOM_W / 2 + 0.04;
      cz = z * 0.55;
      ry = x > 0 ? -Math.PI / 2 : Math.PI / 2;
    }
    return {
      artifact: planet.artifacts[i],
      position: [cx, cy, cz] as [number, number, number],
      rotationY: ry,
      index: i,
    };
  });

  return (
    <group position={ROOM_ORIGIN}>
      {/* ── Floor: single polished tone ─────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial
          color={theme.floor}
          metalness={0.18}
          roughness={0.55}
        />
      </mesh>

      {/* Subtle thin accent line ringing the floor (single architectural cue) */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ROOM_W / 2 - 1.2, ROOM_W / 2 - 1.18, 96]} />
        <meshStandardMaterial
          color={theme.accent}
          emissive={theme.accent}
          emissiveIntensity={0.2}
          metalness={0.4}
          roughness={0.4}
          toneMapped={false}
        />
      </mesh>

      {/* ── Ceiling: single tone with one slim recessed skylight ── */}
      <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial
          color={theme.ceiling}
          metalness={0.0}
          roughness={0.92}
        />
      </mesh>
      <mesh position={[0, ROOM_H - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 2.6]} />
        <meshBasicMaterial color={theme.lightColor} toneMapped={false} />
      </mesh>

      {/* ── Walls: single matte tone, no trims ──────────────────── */}
      {([
        { pos: [0, ROOM_H / 2, -ROOM_D / 2] as const, rot: [0, 0, 0] as const, w: ROOM_W },
        { pos: [0, ROOM_H / 2, ROOM_D / 2] as const, rot: [0, Math.PI, 0] as const, w: ROOM_W },
        { pos: [-ROOM_W / 2, ROOM_H / 2, 0] as const, rot: [0, Math.PI / 2, 0] as const, w: ROOM_D },
        { pos: [ROOM_W / 2, ROOM_H / 2, 0] as const, rot: [0, -Math.PI / 2, 0] as const, w: ROOM_D },
      ]).map((W, idx) => (
        <mesh
          key={`wall-${idx}`}
          position={W.pos as unknown as [number, number, number]}
          rotation={W.rot as unknown as [number, number, number]}
        >
          <planeGeometry args={[W.w, ROOM_H]} />
          <meshStandardMaterial
            color={theme.wall}
            metalness={0.02}
            roughness={0.92}
            side={2}
          />
        </mesh>
      ))}

      {/* ── Title text engraved on the back wall ────────────────── */}
      <group position={[0, ROOM_H * 0.7, -ROOM_D / 2 + 0.04]}>
        <Text
          position={[0, 0.18, 0]}
          fontSize={0.6}
          color={theme.textColor}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.02}
        >
          {planet.name}
        </Text>
        <mesh position={[0, -0.05, 0]}>
          <planeGeometry args={[1.6, 0.01]} />
          <meshStandardMaterial
            color={theme.accent}
            emissive={theme.accent}
            emissiveIntensity={0.3}
            toneMapped={false}
          />
        </mesh>
        <Text
          position={[0, -0.22, 0]}
          fontSize={0.13}
          color={theme.textColor}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.32}
        >
          {planet.tagline.toUpperCase()}
        </Text>
      </group>

      {/* ── Wall labels (text-only, one per artifact) ───────────── */}
      {labelData.map((c, i) => (
        <group
          key={`label-${i}`}
          position={c.position}
          rotation={[0, c.rotationY, 0]}
        >
          <mesh position={[0, 0.18, 0.01]}>
            <planeGeometry args={[0.6, 0.012]} />
            <meshStandardMaterial
              color={c.artifact.color}
              emissive={c.artifact.color}
              emissiveIntensity={0.3}
              metalness={0.4}
              roughness={0.4}
              toneMapped={false}
            />
          </mesh>
          <Text
            position={[0, 0.0, 0.02]}
            fontSize={0.18}
            color={theme.textColor}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.04}
          >
            {c.artifact.name}
          </Text>
          <Text
            position={[0, -0.16, 0.02]}
            fontSize={0.045}
            color={theme.textColor}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.36}
          >
            {`NO. ${String(i + 1).padStart(2, "0")}`}
          </Text>
        </group>
      ))}

      {/* ── Lighting: ambient + skylight wash + per-pedestal spot ── */}
      <ambientLight intensity={theme.ambient} color={theme.ambientColor} />
      <pointLight
        position={[0, ROOM_H - 0.4, 0]}
        color={theme.lightColor}
        intensity={theme.lightIntensity * 28}
        distance={26}
        decay={1.6}
      />
      {stonePositions.map((p, i) => (
        <spotLight
          key={`spot-${i}`}
          position={[p[0] * 0.55, ROOM_H - 0.2, p[2] * 0.55]}
          target-position={[p[0], 1, p[2]]}
          color={theme.lightColor}
          intensity={6}
          angle={0.42}
          penumbra={0.7}
          distance={ROOM_H * 2}
          decay={1.8}
        />
      ))}

      {/* Quiet ambient motes */}
      <DustMotes
        bounds={[ROOM_W * 0.85, ROOM_H, ROOM_D * 0.85]}
        count={70}
        color={theme.lightColor}
      />

      {/* ── Artifact stones ────────────────────────────────────── */}
      {planet.artifacts.map((a, i) => (
        <Stone key={a.id} artifact={a} position={stonePositions[i]} />
      ))}

      {/* ── The astronaut ──────────────────────────────────────── */}
      <Astronaut planet={planet} />
    </group>
  );
}
