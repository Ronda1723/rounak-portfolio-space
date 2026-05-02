import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import { Group, Vector3 } from "three";
import { PLANETS } from "../config/planets";
import { SATELLITES } from "../config/satellites";
import { useGameStore } from "../state/useGameStore";
import { planetWorldPositions } from "./planetWorldPositions";
import { satelliteWorldPositions } from "./satelliteWorldPositions";

type Props = {
  rocketRef: RefObject<Group | null>;
};

const SATELLITE_DOCK_RADIUS = 3.0;

export function ProximityDetector({ rocketRef }: Props) {
  const tmp = useRef(new Vector3());
  const tickRef = useRef(0);
  const setNear = useGameStore((s) => s.setNear);
  const setNearSatellite = useGameStore((s) => s.setNearSatellite);
  const near = useGameStore((s) => s.nearPlanet);
  const nearSat = useGameStore((s) => s.nearSatellite);
  const mode = useGameStore((s) => s.mode);

  useFrame((_, dt) => {
    tickRef.current += dt;
    if (tickRef.current < 0.12) return;
    tickRef.current = 0;
    if (mode === "docked" || mode === "exploring" || mode === "warping") return;
    if (!rocketRef.current) return;

    const rocketPos = rocketRef.current.position;

    // Planets
    let nearestPlanet: { planet: typeof PLANETS[number]; dist: number } | null = null;
    for (const p of PLANETS) {
      const wp = planetWorldPositions.get(p.id);
      if (!wp) continue;
      tmp.current.copy(wp).sub(rocketPos);
      const d = tmp.current.length();
      if (d < p.landRadius && (!nearestPlanet || d < nearestPlanet.dist)) {
        nearestPlanet = { planet: p, dist: d };
      }
    }
    if (nearestPlanet) {
      if (!near || near.id !== nearestPlanet.planet.id) setNear(nearestPlanet.planet);
    } else if (near) {
      setNear(null);
    }

    // Satellites
    let nearestSat: { sat: typeof SATELLITES[number]; dist: number } | null = null;
    for (const s of SATELLITES) {
      const wp = satelliteWorldPositions.get(s.id);
      if (!wp) continue;
      tmp.current.copy(wp).sub(rocketPos);
      const d = tmp.current.length();
      if (d < SATELLITE_DOCK_RADIUS && (!nearestSat || d < nearestSat.dist)) {
        nearestSat = { sat: s, dist: d };
      }
    }
    if (nearestSat) {
      if (!nearSat || nearSat.id !== nearestSat.sat.id) setNearSatellite(nearestSat.sat);
    } else if (nearSat) {
      setNearSatellite(null);
    }
  });

  return null;
}
