import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DoubleSide, Group, AdditiveBlending, Vector3 } from "three";
import { useGameStore } from "../state/useGameStore";
import type { Planet } from "../config/planets";
import { stationWorldPositions } from "./stationTracker";

type Props = {
  planet: Planet;
};

const tmpWorld = new Vector3();

export function DockingStation({ planet }: Props) {
  const stationOrbitRef = useRef<Group>(null);
  const stationBodyRef = useRef<Group>(null);
  const beaconRef = useRef<Group>(null);
  const dishRef = useRef<Group>(null);

  const near = useGameStore((s) => s.nearPlanet);
  const docked = useGameStore((s) => s.dockedPlanet);
  const isNear = near?.id === planet.id;
  const isDocked = docked?.id === planet.id;

  useFrame((_, dt) => {
    if (stationOrbitRef.current) {
      stationOrbitRef.current.rotation.y += dt * 0.16;
    }
    if (beaconRef.current) {
      const t = performance.now() * 0.0035;
      const v = (Math.sin(t) + 1) * 0.5;
      beaconRef.current.scale.setScalar(0.85 + v * 0.3);
    }
    if (dishRef.current) {
      dishRef.current.rotation.y += dt * 0.4;
    }
    if (stationBodyRef.current) {
      stationBodyRef.current.getWorldPosition(tmpWorld);
      let stored = stationWorldPositions.get(planet.id);
      if (!stored) {
        stored = new Vector3();
        stationWorldPositions.set(planet.id, stored);
      }
      stored.copy(tmpWorld);
    }
  });

  const stationRadius = Math.max(planet.size * 1.7, planet.size + 0.6);
  const R = Math.max(0.45, planet.size * 0.35);

  const beaconColor = new Color(isDocked ? "#7AFFAD" : "#5BC0EB");
  const ringOpacity = isDocked ? 0.95 : isNear ? 0.7 : 0.4;

  // Steel material params reused across structural parts
  const steelColor = "#8e979e";
  const darkSteel = "#3a4148";

  return (
    <group ref={stationOrbitRef}>
      <group ref={stationBodyRef} position={[stationRadius, 0, 0]}>
        {/* Glowing dock ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R, R * 0.06, 8, 48]} />
          <meshStandardMaterial
            color={steelColor}
            metalness={0.9}
            roughness={0.28}
            emissive={beaconColor}
            emissiveIntensity={isDocked ? 1.4 : isNear ? 0.6 : 0.2}
          />
        </mesh>

        {/* Three steel struts spanning the ring (forming a Y across the dock) */}
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh
              key={`strut-${i}`}
              position={[Math.cos(a) * R * 0.5, 0, Math.sin(a) * R * 0.5]}
              rotation={[Math.PI / 2, 0, -a]}
            >
              <boxGeometry args={[R * 0.04, R * 1.0, R * 0.04]} />
              <meshStandardMaterial
                color={steelColor}
                metalness={0.85}
                roughness={0.35}
              />
            </mesh>
          );
        })}

        {/* Central steel hub at the strut intersection */}
        <mesh>
          <cylinderGeometry args={[R * 0.13, R * 0.13, R * 0.12, 12]} />
          <meshStandardMaterial
            color={darkSteel}
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>

        {/* Antenna mast rising from hub */}
        <mesh position={[0, R * 0.3, 0]}>
          <cylinderGeometry args={[R * 0.018, R * 0.025, R * 0.5, 8]} />
          <meshStandardMaterial
            color={steelColor}
            metalness={0.7}
            roughness={0.4}
          />
        </mesh>

        {/* Spinning dish on top of mast */}
        <group ref={dishRef} position={[0, R * 0.58, 0]}>
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <cylinderGeometry args={[R * 0.18, R * 0.05, R * 0.04, 16, 1, true]} />
            <meshStandardMaterial
              color="#cfd6dc"
              metalness={0.9}
              roughness={0.18}
              side={DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0, R * 0.04]}>
            <sphereGeometry args={[R * 0.025, 8, 6]} />
            <meshBasicMaterial color="#FF3B30" toneMapped={false} />
          </mesh>
        </group>

        {/* Center beacon — pulses */}
        <group ref={beaconRef}>
          <mesh>
            <sphereGeometry args={[R * 0.13, 16, 12]} />
            <meshBasicMaterial
              color={beaconColor}
              transparent
              opacity={isDocked ? 1.0 : isNear ? 0.9 : 0.6}
              blending={AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
          {(isNear || isDocked) && (
            <pointLight
              color={beaconColor}
              intensity={isDocked ? 18 : 8}
              distance={R * 14}
              decay={2}
            />
          )}
        </group>

        {/* Selection halo */}
        {(isNear || isDocked) && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[R * 1.08, R * 1.28, 64]} />
            <meshBasicMaterial
              color={beaconColor}
              transparent
              opacity={ringOpacity}
              side={DoubleSide}
              blending={AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}
