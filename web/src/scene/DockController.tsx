import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { useGameStore } from "../state/useGameStore";
import { stationWorldPositions } from "./stationTracker";

type Props = {
  rocketRef: RefObject<Group | null>;
};

const tmpTarget = new Vector3();
const tmpVel = new Vector3();

/**
 * While docked, the rocket lerps to the docking station's *current* world
 * position (with a small lift so it sits on top of the station's deck) and
 * smoothly yaws to face the station's direction of motion. Because the
 * station orbits the planet, the rocket naturally orbits the planet too.
 */
export function DockController({ rocketRef }: Props) {
  const docked = useGameStore((s) => s.dockedPlanet);
  const lastDockId = useRef<string | null>(null);
  const lastStationPos = useRef(new Vector3());
  const haveLast = useRef(false);

  useFrame((_, dt) => {
    const rocket = rocketRef.current;
    if (!rocket || !docked) {
      lastDockId.current = null;
      haveLast.current = false;
      return;
    }

    const stationPos = stationWorldPositions.get(docked.id);
    if (!stationPos) return;

    const isFirstFrame = lastDockId.current !== docked.id;

    // Station size mirrors the constants in DockingStation.tsx so the rocket
    // lands flush on top of the pad deck.
    const S = Math.max(0.4, docked.size * 0.32);
    const padTop = S * 0.5 + S * 0.1;
    const lift = padTop + 0.15;
    tmpTarget.copy(stationPos);
    tmpTarget.y = lift;

    const posLerp = isFirstFrame
      ? 1 - Math.pow(0.001, dt * 0.5)
      : 1 - Math.pow(0.0005, dt);
    rocket.position.lerp(tmpTarget, posLerp);

    // Compute station velocity for tangent-direction yaw.
    if (haveLast.current) {
      tmpVel.subVectors(stationPos, lastStationPos.current);
      // Only update yaw if station actually moved (avoid NaN at first dock).
      if (tmpVel.lengthSq() > 1e-6) {
        const targetYaw = Math.atan2(tmpVel.x, tmpVel.z) + Math.PI;
        let diff = targetYaw - rocket.rotation.y;
        diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
        const yawLerp = isFirstFrame
          ? 1 - Math.pow(0.05, dt * 0.5)
          : 1 - Math.pow(0.05, dt);
        rocket.rotation.y += diff * yawLerp;
      }
    }
    rocket.rotation.x = 0;
    rocket.rotation.z = 0;

    lastStationPos.current.copy(stationPos);
    haveLast.current = true;
    if (isFirstFrame) lastDockId.current = docked.id;
  });

  return null;
}
