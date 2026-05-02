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

  // Compact station — sized so the rocket has a clear target without
  // overwhelming the planet. Slight clearance from the planet surface.
  const stationRadius = Math.max(planet.size * 1.7, planet.size + 0.6);
  const S = Math.max(0.4, planet.size * 0.32); // station size
  const padR = S * 1.05;
  const padThick = S * 0.1;

  const beaconColor = new Color(isDocked ? "#7AFFAD" : isNear ? "#5BC0EB" : "#5BC0EB");
  const beaconOpacity = isDocked ? 1.0 : isNear ? 0.85 : 0.55;
  const beaconStrength = isDocked ? 4.5 : isNear ? 2.5 : 1.2;

  return (
    <group ref={stationOrbitRef}>
      <group ref={stationBodyRef} position={[stationRadius, 0, 0]}>
        {/* TOP LANDING PAD — flat octagonal deck the rocket sits on */}
        <mesh position={[0, S * 0.5, 0]}>
          <cylinderGeometry args={[padR, padR, padThick, 8]} />
          <meshStandardMaterial color="#cfd6dc" metalness={0.78} roughness={0.32} />
        </mesh>

        {/* Pad inner ring (target marker) */}
        <mesh position={[0, S * 0.5 + padThick * 0.51, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[padR * 0.42, padR * 0.62, 32]} />
          <meshBasicMaterial
            color={beaconColor}
            transparent
            opacity={isDocked ? 0.95 : 0.55}
            side={DoubleSide}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* Pad outer trim */}
        <mesh position={[0, S * 0.5 + padThick * 0.5, 0]}>
          <torusGeometry args={[padR * 0.98, padThick * 0.18, 8, 32]} />
          <meshStandardMaterial color="#7c8a94" metalness={0.7} roughness={0.42} />
        </mesh>

        {/* CENTRAL HABITAT — torus + cross */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[S * 0.62, S * 0.13, 12, 32]} />
          <meshStandardMaterial color="#9aa3aa" metalness={0.85} roughness={0.32} />
        </mesh>

        {/* CONNECTING PYLONS — 4 columns supporting the pad */}
        {[0, 1, 2, 3].map((i) => {
          const a = i * (Math.PI / 2) + Math.PI / 4;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * padR * 0.7, S * 0.18, Math.sin(a) * padR * 0.7]}
            >
              <cylinderGeometry
                args={[S * 0.05, S * 0.05, S * 0.6, 6]}
              />
              <meshStandardMaterial color="#7c8a94" metalness={0.65} roughness={0.45} />
            </mesh>
          );
        })}

        {/* SOLAR PANEL WINGS */}
        <mesh position={[S * 1.55, S * 0.05, 0]}>
          <boxGeometry args={[S * 1.4, S * 0.06, S * 0.7]} />
          <meshStandardMaterial
            color="#0e1d3a"
            metalness={0.75}
            roughness={0.42}
            emissive="#0a1f44"
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[-S * 1.55, S * 0.05, 0]}>
          <boxGeometry args={[S * 1.4, S * 0.06, S * 0.7]} />
          <meshStandardMaterial
            color="#0e1d3a"
            metalness={0.75}
            roughness={0.42}
            emissive="#0a1f44"
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* DOWNWARD KEEL — module hanging below */}
        <mesh position={[0, -S * 0.45, 0]}>
          <boxGeometry args={[S * 0.5, S * 0.5, S * 0.5]} />
          <meshStandardMaterial color="#a4adb5" metalness={0.55} roughness={0.45} />
        </mesh>

        {/* ANTENNA */}
        <mesh position={[0, S * 1.05, 0]}>
          <cylinderGeometry args={[S * 0.025, S * 0.04, S * 0.6, 6]} />
          <meshStandardMaterial color="#7c8a94" metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[0, S * 1.4, 0]}>
          <sphereGeometry args={[S * 0.07, 10, 8]} />
          <meshBasicMaterial color="#FF3B30" toneMapped={false} />
        </mesh>

        {/* BEACON LIGHTS — meshes always; real point lights only on the active station to keep GPU happy */}
        <group ref={beaconRef}>
          {[0, 1, 2, 3].map((i) => {
            const a = i * (Math.PI / 2);
            return (
              <group key={i} position={[Math.cos(a) * padR * 0.95, S * 0.55, Math.sin(a) * padR * 0.95]}>
                <mesh>
                  <sphereGeometry args={[S * 0.09, 10, 8]} />
                  <meshBasicMaterial
                    color={beaconColor}
                    transparent
                    opacity={beaconOpacity}
                    blending={AdditiveBlending}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            );
          })}
          {(isNear || isDocked) && (
            <pointLight
              color={beaconColor}
              intensity={beaconStrength * 4}
              distance={S * 12}
              decay={2}
              position={[0, S * 0.6, 0]}
            />
          )}
        </group>

        {/* SELECTION HALO — pulses on the pad when docked / near */}
        {(isNear || isDocked) && (
          <mesh
            position={[0, S * 0.5 + padThick * 0.55, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[padR * 1.06, padR * 1.22, 64]} />
            <meshBasicMaterial
              color={beaconColor}
              transparent
              opacity={isDocked ? 0.9 : 0.55}
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
