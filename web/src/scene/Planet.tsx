import { useRef } from "react";
import { useFrame, useLoader, type ThreeEvent } from "@react-three/fiber";
import {
  Group,
  Mesh,
  TextureLoader,
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  Vector3,
} from "three";
import type { Planet as PlanetData } from "../config/planets";
import { useGameStore } from "../state/useGameStore";
import { planetWorldPositions } from "./planetWorldPositions";
import { DockingStation } from "./DockingStation";

type Props = {
  planet: PlanetData;
};

const tmpVec = new Vector3();

export function Planet({ planet }: Props) {
  const orbitGroupRef = useRef<Group>(null);
  const planetGroupRef = useRef<Group>(null);
  const planetRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);

  const texture = useLoader(TextureLoader, planet.texture);
  const cloudsTex = useLoader(
    TextureLoader,
    planet.cloudsTexture ?? "/assets/textures/2k_neptune.jpg"
  );
  const ringTex = useLoader(
    TextureLoader,
    planet.ringTexture ?? "/assets/textures/8k_saturn_ring_alpha.png"
  );

  const setTarget = useGameStore((s) => s.setTarget);
  const setHovered = useGameStore((s) => s.setHovered);
  const mode = useGameStore((s) => s.mode);
  const near = useGameStore((s) => s.nearPlanet);
  const docked = useGameStore((s) => s.dockedPlanet);
  const hovered = useGameStore((s) => s.hoveredPlanet);

  const isHovered = hovered?.id === planet.id;
  const isNear = near?.id === planet.id;
  const isDocked = docked?.id === planet.id;

  useFrame((_, dt) => {
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y += planet.orbitSpeed * dt;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += planet.spinSpeed * dt;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += planet.spinSpeed * dt * 1.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += dt * 0.005;
    }
    if (planetGroupRef.current) {
      planetGroupRef.current.getWorldPosition(tmpVec);
      let stored = planetWorldPositions.get(planet.id);
      if (!stored) {
        stored = new Vector3();
        planetWorldPositions.set(planet.id, stored);
      }
      stored.copy(tmpVec);
    }
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (mode === "exploring" || mode === "docked" || mode === "warping") return;
    setTarget(planet);
  };
  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    setHovered(planet);
  };
  const onPointerOut = () => {
    document.body.style.cursor = "auto";
    setHovered(null);
  };

  return (
    <group ref={orbitGroupRef} rotation={[0, planet.orbitAngle, 0]}>
      <group ref={planetGroupRef} position={[planet.orbitRadius, 0, 0]}>
        <group rotation={[0, 0, planet.axialTilt]}>
          <mesh
            ref={planetRef}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
          >
            <sphereGeometry args={[planet.size, 64, 32]} />
            <meshStandardMaterial
              map={texture}
              roughness={planet.hasAtmosphere ? 0.4 : 0.55}
              metalness={0.08}
              envMapIntensity={1.4}
            />
          </mesh>

          {planet.cloudsTexture && (
            <mesh ref={cloudsRef} scale={1.018}>
              <sphereGeometry args={[planet.size, 48, 24]} />
              <meshStandardMaterial
                map={cloudsTex}
                transparent
                opacity={0.55}
                depthWrite={false}
              />
            </mesh>
          )}

          {planet.hasAtmosphere && (
            <mesh scale={1.08}>
              <sphereGeometry args={[planet.size, 48, 24]} />
              <meshBasicMaterial
                color={new Color(planet.color)}
                transparent
                opacity={0.18}
                side={BackSide}
                blending={AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          )}

          {planet.ringTexture && (
            <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[planet.size * 1.3, planet.size * 2.3, 96]} />
              <meshBasicMaterial
                map={ringTex}
                transparent
                opacity={0.95}
                side={DoubleSide}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry
            args={[planet.landRadius * 0.92, planet.landRadius, 96]}
          />
          <meshBasicMaterial
            color={new Color(isDocked ? "#7affad" : isNear ? "#5BC0EB" : "#5BC0EB")}
            transparent
            opacity={isDocked ? 0.9 : isNear ? 0.55 : isHovered ? 0.3 : 0}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <DockingStation planet={planet} />
      </group>
    </group>
  );
}
