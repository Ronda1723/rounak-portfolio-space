import { Text } from "@react-three/drei";
import type { Artifact, Planet } from "../config/planets";
import { Stone } from "./Stone";
import { Astronaut } from "./Astronaut";
import { DustMotes } from "./DustMotes";

type Theme = {
  floor: string;
  floorInlay: string;
  wall: string;
  wallLower: string;       // wainscoting (lower 1/3)
  wallTrim: string;        // chair rail / molding
  ceiling: string;
  crown: string;           // crown molding
  column: string;
  columnCap: string;
  accent: string;
  ambient: number;
  ambientColor: string;
  lightColor: string;
  lightIntensity: number;
  textColor: string;
};

const THEMES: Record<string, Theme> = {
  desert: {
    floor: "#a87858",
    floorInlay: "#5a3a1f",
    wall: "#e8c8a4",
    wallLower: "#a06a3e",
    wallTrim: "#8a5a3a",
    ceiling: "#f4e4cc",
    crown: "#8a5a3a",
    column: "#d8b896",
    columnCap: "#8a5a3a",
    accent: "#ff8c4a",
    ambient: 0.55,
    ambientColor: "#ffd8b0",
    lightColor: "#ffc89a",
    lightIntensity: 1.2,
    textColor: "#3a2010",
  },
  industrial: {
    floor: "#2c333c",
    floorInlay: "#5BC0EB",
    wall: "#dde2e8",
    wallLower: "#3a4048",
    wallTrim: "#6a737c",
    ceiling: "#f4f6f9",
    crown: "#6a737c",
    column: "#8a939c",
    columnCap: "#3a4048",
    accent: "#5BC0EB",
    ambient: 0.55,
    ambientColor: "#dde8f4",
    lightColor: "#ffffff",
    lightIntensity: 1.4,
    textColor: "#0e1320",
  },
  stone: {
    floor: "#5a544c",
    floorInlay: "#c9a55c",
    wall: "#e8dcc4",
    wallLower: "#9a8a6a",
    wallTrim: "#7a6a4a",
    ceiling: "#f4ecd8",
    crown: "#7a6a4a",
    column: "#cfc4a8",
    columnCap: "#7a6a4a",
    accent: "#e6c98a",
    ambient: 0.5,
    ambientColor: "#f4dcb0",
    lightColor: "#fff0d0",
    lightIntensity: 1.3,
    textColor: "#3a2a10",
  },
  verdant: {
    floor: "#5a6a52",
    floorInlay: "#2a4a32",
    wall: "#f4f8ec",
    wallLower: "#6a8a5a",
    wallTrim: "#4a6a3a",
    ceiling: "#fafff0",
    crown: "#4a6a3a",
    column: "#dde6dc",
    columnCap: "#4a6a3a",
    accent: "#7AFFAD",
    ambient: 0.6,
    ambientColor: "#e8f4dc",
    lightColor: "#ffffff",
    lightIntensity: 1.5,
    textColor: "#1a3010",
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
export const WALK_HALF_W = ROOM_W / 2 - 1.4;
export const WALK_HALF_D = ROOM_D / 2 - 1.4;

export function stoneLayoutAngle(index: number, total: number) {
  return (index / total) * Math.PI * 2 + Math.PI / 4;
}

const WAIN_HEIGHT = 1.3;
const CROWN_HEIGHT = 0.32;

type Props = {
  planet: Planet;
};

/** Framed exhibit card with the artifact name + accent color. */
function ExhibitCard({
  artifact,
  position,
  rotationY,
  textColor,
  trim,
}: {
  artifact: Artifact;
  position: [number, number, number];
  rotationY: number;
  textColor: string;
  trim: string;
}) {
  const [x, y, z] = position;
  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
      {/* Outer frame — slim metal */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[1.6, 1.0]} />
        <meshStandardMaterial color={trim} metalness={0.65} roughness={0.35} />
      </mesh>
      {/* Mat */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[1.45, 0.86]} />
        <meshStandardMaterial color="#fafaf6" metalness={0.05} roughness={0.7} />
      </mesh>
      {/* Color swatch / "exhibit image" */}
      <mesh position={[0, 0.16, 0.018]}>
        <planeGeometry args={[1.32, 0.46]} />
        <meshStandardMaterial
          color={artifact.color}
          emissive={artifact.color}
          emissiveIntensity={0.18}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      {/* Title text */}
      <Text
        position={[0, -0.18, 0.03]}
        fontSize={0.13}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.4}
      >
        {artifact.name.toUpperCase()}
      </Text>
      {/* Subtitle */}
      <Text
        position={[0, -0.32, 0.03]}
        fontSize={0.058}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.4}
        letterSpacing={0.18}
      >
        ARTIFACT
      </Text>
    </group>
  );
}

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

  // Each exhibit card sits on the wall behind its corresponding stone.
  // Stones live on a circle; we map each stone to the wall it points toward.
  const cardData = stonePositions.map((p, i) => {
    const [x, , z] = p;
    // Determine which wall is closest to this stone's outward direction.
    // Wall normals (pointing inward toward room center):
    //   back wall (-Z):  normal +Z
    //   front wall (+Z): normal -Z
    //   left wall (-X):  normal +X
    //   right wall (+X): normal -X
    let cx = 0,
      cy = ROOM_H * 0.55,
      cz = 0,
      ry = 0;
    const ax = Math.abs(x);
    const az = Math.abs(z);
    if (az >= ax) {
      // Front or back wall
      cz = z > 0 ? ROOM_D / 2 - 0.08 : -ROOM_D / 2 + 0.08;
      cx = x * 0.4; // pull slightly toward center
      ry = z > 0 ? Math.PI : 0;
    } else {
      cx = x > 0 ? ROOM_W / 2 - 0.08 : -ROOM_W / 2 + 0.08;
      cz = z * 0.4;
      ry = x > 0 ? -Math.PI / 2 : Math.PI / 2;
    }
    return { artifact: planet.artifacts[i], position: [cx, cy, cz] as [number, number, number], rotationY: ry };
  });

  return (
    <group position={ROOM_ORIGIN}>
      {/* ── Floor ──────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color={theme.floor} metalness={0.2} roughness={0.65} />
      </mesh>

      {/* Floor concentric inlays (centerpiece motif) */}
      {[2.4, 1.8, 1.2].map((r, i) => (
        <mesh
          key={`floor-ring-${i}`}
          position={[0, 0.001 + i * 0.0002, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[r - 0.05, r, 96]} />
          <meshStandardMaterial
            color={theme.floorInlay}
            metalness={0.5}
            roughness={0.4}
            emissive={theme.accent}
            emissiveIntensity={0.05}
          />
        </mesh>
      ))}
      {/* Compass star: 8 radial lines from center */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={`floor-radial-${i}`}
            position={[Math.cos(a) * 1.6, 0.0015, Math.sin(a) * 1.6]}
            rotation={[-Math.PI / 2, 0, -a]}
          >
            <planeGeometry args={[1.5, 0.04]} />
            <meshStandardMaterial color={theme.floorInlay} metalness={0.4} roughness={0.5} />
          </mesh>
        );
      })}
      {/* Center medallion */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 48]} />
        <meshStandardMaterial
          color={theme.accent}
          metalness={0.7}
          roughness={0.3}
          emissive={theme.accent}
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* ── Ceiling ────────────────────────────────────────────── */}
      <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color={theme.ceiling} metalness={0.05} roughness={0.85} />
      </mesh>
      {/* Coffered ceiling beams */}
      {[-ROOM_D / 4, 0, ROOM_D / 4].map((z, i) => (
        <mesh key={`beam-z-${i}`} position={[0, ROOM_H - 0.12, z]}>
          <boxGeometry args={[ROOM_W - 0.4, 0.18, 0.2]} />
          <meshStandardMaterial color={theme.crown} metalness={0.4} roughness={0.45} />
        </mesh>
      ))}
      {[-ROOM_W / 4, 0, ROOM_W / 4].map((x, i) => (
        <mesh key={`beam-x-${i}`} position={[x, ROOM_H - 0.12, 0]}>
          <boxGeometry args={[0.2, 0.18, ROOM_D - 0.4]} />
          <meshStandardMaterial color={theme.crown} metalness={0.4} roughness={0.45} />
        </mesh>
      ))}

      {/* Slim skylight strip */}
      <mesh position={[0, ROOM_H - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 3.0]} />
        <meshBasicMaterial color={theme.lightColor} toneMapped={false} />
      </mesh>

      {/* ── Walls (painted upper + wainscoting lower) ──────────── */}
      {([
        { pos: [0, 0, -ROOM_D / 2] as const, rot: [0, 0, 0] as const, w: ROOM_W },
        { pos: [0, 0, ROOM_D / 2] as const, rot: [0, Math.PI, 0] as const, w: ROOM_W },
        { pos: [-ROOM_W / 2, 0, 0] as const, rot: [0, Math.PI / 2, 0] as const, w: ROOM_D },
        { pos: [ROOM_W / 2, 0, 0] as const, rot: [0, -Math.PI / 2, 0] as const, w: ROOM_D },
      ]).map((W, idx) => (
        <group key={`wall-${idx}`} position={W.pos as unknown as [number, number, number]} rotation={W.rot as unknown as [number, number, number]}>
          {/* Upper painted wall (above wainscoting) */}
          <mesh position={[0, (WAIN_HEIGHT + ROOM_H) / 2, 0]}>
            <planeGeometry args={[W.w, ROOM_H - WAIN_HEIGHT]} />
            <meshStandardMaterial
              color={theme.wall}
              metalness={0.05}
              roughness={0.85}
              side={2}
            />
          </mesh>
          {/* Wainscoting (lower) */}
          <mesh position={[0, WAIN_HEIGHT / 2, 0]}>
            <planeGeometry args={[W.w, WAIN_HEIGHT]} />
            <meshStandardMaterial
              color={theme.wallLower}
              metalness={0.15}
              roughness={0.65}
              side={2}
            />
          </mesh>
          {/* Wainscoting panel divisions (raised vertical bars) */}
          {Array.from({ length: 6 }).map((_, i) => {
            const x = -W.w / 2 + (i + 0.5) * (W.w / 6);
            return (
              <mesh key={`wpanel-${i}`} position={[x, WAIN_HEIGHT / 2, 0.015]}>
                <boxGeometry args={[0.04, WAIN_HEIGHT - 0.16, 0.015]} />
                <meshStandardMaterial color={theme.wallTrim} metalness={0.3} roughness={0.55} />
              </mesh>
            );
          })}
          {/* Chair rail (horizontal trim at top of wainscoting) */}
          <mesh position={[0, WAIN_HEIGHT, 0.025]}>
            <boxGeometry args={[W.w, 0.1, 0.045]} />
            <meshStandardMaterial color={theme.wallTrim} metalness={0.45} roughness={0.4} />
          </mesh>
          {/* Skirting (base trim) */}
          <mesh position={[0, 0.18, 0.025]}>
            <boxGeometry args={[W.w, 0.36, 0.05]} />
            <meshStandardMaterial color={theme.wallTrim} metalness={0.3} roughness={0.5} />
          </mesh>
          {/* Crown molding */}
          <mesh position={[0, ROOM_H - CROWN_HEIGHT / 2, 0.04]}>
            <boxGeometry args={[W.w, CROWN_HEIGHT, 0.08]} />
            <meshStandardMaterial color={theme.crown} metalness={0.4} roughness={0.45} />
          </mesh>
        </group>
      ))}

      {/* ── 4 corner columns (decorative) ──────────────────────── */}
      {([
        [-ROOM_W / 2 + 1.2, -ROOM_D / 2 + 1.2],
        [ROOM_W / 2 - 1.2, -ROOM_D / 2 + 1.2],
        [-ROOM_W / 2 + 1.2, ROOM_D / 2 - 1.2],
        [ROOM_W / 2 - 1.2, ROOM_D / 2 - 1.2],
      ] as const).map(([cx, cz], i) => (
        <group key={`col-${i}`} position={[cx, 0, cz]}>
          {/* Plinth */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.8, 0.4, 0.8]} />
            <meshStandardMaterial color={theme.columnCap} metalness={0.4} roughness={0.45} />
          </mesh>
          {/* Shaft (fluted-feeling cylinder) */}
          <mesh position={[0, ROOM_H / 2, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, ROOM_H - 0.6, 16]} />
            <meshStandardMaterial color={theme.column} metalness={0.2} roughness={0.55} />
          </mesh>
          {/* Capital (top) */}
          <mesh position={[0, ROOM_H - 0.3, 0]} castShadow>
            <boxGeometry args={[0.7, 0.18, 0.7]} />
            <meshStandardMaterial color={theme.columnCap} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, ROOM_H - 0.46, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.28, 0.14, 24]} />
            <meshStandardMaterial color={theme.columnCap} metalness={0.55} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* ── Title plate on the back wall ──────────────────────── */}
      <group position={[0, ROOM_H * 0.7, -ROOM_D / 2 + 0.06]}>
        <mesh>
          <planeGeometry args={[8, 1.2]} />
          <meshStandardMaterial color="#0e1320" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.003]}>
          <planeGeometry args={[7.7, 1.0]} />
          <meshStandardMaterial
            color={theme.accent}
            emissive={theme.accent}
            emissiveIntensity={0.25}
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>
        <Text
          position={[0, 0.12, 0.012]}
          fontSize={0.45}
          color={theme.textColor}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          {planet.name.toUpperCase()}
        </Text>
        <Text
          position={[0, -0.28, 0.012]}
          fontSize={0.13}
          color={theme.textColor}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.32}
        >
          {planet.tagline.toUpperCase()}
        </Text>
      </group>

      {/* ── Wall exhibit cards (one per artifact) ─────────────── */}
      {cardData.map((c, i) => (
        <ExhibitCard
          key={`card-${i}`}
          artifact={c.artifact}
          position={c.position}
          rotationY={c.rotationY}
          textColor={theme.textColor}
          trim={theme.wallTrim}
        />
      ))}

      {/* ── Lighting ──────────────────────────────────────────── */}
      <ambientLight intensity={theme.ambient} color={theme.ambientColor} />
      {/* Skylight wash */}
      <pointLight
        position={[0, ROOM_H - 0.4, 0]}
        color={theme.lightColor}
        intensity={theme.lightIntensity * 32}
        distance={28}
        decay={1.6}
      />
      {/* Spotlight per pedestal */}
      {stonePositions.map((p, i) => (
        <spotLight
          key={`spot-${i}`}
          position={[p[0] * 0.55, ROOM_H - 0.2, p[2] * 0.55]}
          target-position={[p[0], 1, p[2]]}
          color={theme.lightColor}
          intensity={7}
          angle={0.45}
          penumbra={0.6}
          distance={ROOM_H * 2}
          decay={1.8}
        />
      ))}
      {/* Soft accent lights at the corners */}
      {[
        [-ROOM_W / 2 + 1.5, 0.7, -ROOM_D / 2 + 1.5],
        [ROOM_W / 2 - 1.5, 0.7, -ROOM_D / 2 + 1.5],
        [-ROOM_W / 2 + 1.5, 0.7, ROOM_D / 2 - 1.5],
        [ROOM_W / 2 - 1.5, 0.7, ROOM_D / 2 - 1.5],
      ].map((pos, i) => (
        <pointLight
          key={`corner-${i}`}
          position={pos as [number, number, number]}
          color={theme.accent}
          intensity={3}
          distance={5}
          decay={2}
        />
      ))}

      {/* ── Ambient dust motes ───────────────────────────────── */}
      <DustMotes
        bounds={[ROOM_W * 0.85, ROOM_H, ROOM_D * 0.85]}
        count={140}
        color={theme.lightColor}
      />

      {/* ── Artifact stones with vitrines ─────────────────────── */}
      {planet.artifacts.map((a, i) => (
        <Stone key={a.id} artifact={a} position={stonePositions[i]} />
      ))}

      {/* ── The astronaut ─────────────────────────────────────── */}
      <Astronaut planet={planet} />
    </group>
  );
}
