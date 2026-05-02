import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import { Group } from "three";
import { useGameStore } from "../state/useGameStore";
import { SUN_RADIUS } from "../config/planets";

type Props = {
  rocketRef: RefObject<Group | null>;
};

const CAUTION_DIST = SUN_RADIUS + 5.5;
const CRITICAL_DIST = SUN_RADIUS + 2.5;
const DEATH_AT = 5.0; // seconds in critical → vessel destroyed

export function SunHazard({ rocketRef }: Props) {
  const tickRef = useRef(0);
  const dangerTime = useRef(0);
  const setHazard = useGameStore((s) => s.setHazard);
  const setSunDangerTime = useGameStore((s) => s.setSunDangerTime);
  const triggerExplosion = useGameStore((s) => s.triggerExplosion);
  const mode = useGameStore((s) => s.mode);

  useFrame((_, dt) => {
    const rocket = rocketRef.current;
    if (!rocket) return;
    if (mode === "docked" || mode === "exploring" || mode === "warping" || mode === "exploded") {
      // Decay danger timer when not in regular flight.
      if (dangerTime.current > 0) {
        dangerTime.current = 0;
        setSunDangerTime(0);
      }
      return;
    }

    const dist = rocket.position.length();
    let nextLevel: "none" | "caution" | "critical" = "none";
    if (dist < CRITICAL_DIST) nextLevel = "critical";
    else if (dist < CAUTION_DIST) nextLevel = "caution";

    if (nextLevel === "critical") {
      dangerTime.current += dt;
      if (dangerTime.current >= DEATH_AT) {
        dangerTime.current = 0;
        setSunDangerTime(0);
        triggerExplosion();
        return;
      }
    } else {
      // Decay slowly so brief proximity doesn't auto-die later.
      dangerTime.current = Math.max(0, dangerTime.current - dt * 1.4);
    }

    tickRef.current += dt;
    if (tickRef.current < 0.08) return;
    tickRef.current = 0;

    setSunDangerTime(dangerTime.current);
    setHazard(nextLevel, dist);
  });

  return null;
}
