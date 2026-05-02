import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import { Group, Vector3 } from "three";
import { PLANETS } from "../config/planets";
import { useGameStore } from "../state/useGameStore";
import { planetWorldPositions } from "./planetWorldPositions";

type Props = {
  rocketRef: RefObject<Group | null>;
};

export function ProximityDetector({ rocketRef }: Props) {
  const tmp = useRef(new Vector3());
  const tickRef = useRef(0);
  const setNear = useGameStore((s) => s.setNear);
  const near = useGameStore((s) => s.nearPlanet);
  const mode = useGameStore((s) => s.mode);

  useFrame((_, dt) => {
    tickRef.current += dt;
    if (tickRef.current < 0.12) return;
    tickRef.current = 0;
    if (mode === "docked" || mode === "exploring" || mode === "warping") return;
    if (!rocketRef.current) return;

    const rocketPos = rocketRef.current.position;
    let nearest: { planet: typeof PLANETS[number]; dist: number } | null = null;

    for (const p of PLANETS) {
      const wp = planetWorldPositions.get(p.id);
      if (!wp) continue;
      tmp.current.copy(wp).sub(rocketPos);
      const d = tmp.current.length();
      if (d < p.landRadius && (!nearest || d < nearest.dist)) {
        nearest = { planet: p, dist: d };
      }
    }

    if (nearest) {
      if (!near || near.id !== nearest.planet.id) setNear(nearest.planet);
    } else if (near) {
      setNear(null);
    }
  });

  return null;
}
