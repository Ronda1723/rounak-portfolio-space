import { useEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { useGameStore } from "../state/useGameStore";
import { planetWorldPositions } from "./planetWorldPositions";

type Props = {
  rocketRef: RefObject<Group | null>;
};

const APPROACH_BACK_OFFSET = 5.0;
const DURATION = 3.0;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function Autopilot({ rocketRef }: Props) {
  const target = useGameStore((s) => s.targetPlanet);
  const setAutopilot = useGameStore((s) => s.setAutopilot);
  const setNear = useGameStore((s) => s.setNear);
  const setTarget = useGameStore((s) => s.setTarget);

  const startPos = useRef(new Vector3());
  const elapsed = useRef(0);
  const tmpRadial = useRef(new Vector3());
  const tmpDest = useRef(new Vector3());
  const tmpToPlanet = useRef(new Vector3());

  useEffect(() => {
    if (!target) return;
    const rocket = rocketRef.current;
    if (!rocket) return;
    startPos.current.copy(rocket.position);
    elapsed.current = 0;
    setAutopilot(true);
  }, [target, rocketRef, setAutopilot]);

  useFrame((_, dt) => {
    if (!target) return;
    const rocket = rocketRef.current;
    if (!rocket) return;

    const planetPos = planetWorldPositions.get(target.id);
    if (!planetPos) return;

    elapsed.current += dt;
    const t = Math.min(1, elapsed.current / DURATION);
    const eased = easeInOutCubic(t);

    // Destination = a bit "outside" the planet on the radial line from the sun.
    tmpRadial.current.copy(planetPos).normalize();
    tmpDest.current
      .copy(planetPos)
      .add(tmpRadial.current.clone().multiplyScalar(APPROACH_BACK_OFFSET));

    rocket.position.lerpVectors(startPos.current, tmpDest.current, eased);
    rocket.position.y = 0;

    // Smoothly yaw toward the planet.
    tmpToPlanet.current.copy(planetPos).sub(rocket.position).normalize();
    const targetYaw =
      Math.atan2(tmpToPlanet.current.x, tmpToPlanet.current.z) + Math.PI;
    let diff = targetYaw - rocket.rotation.y;
    diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
    rocket.rotation.y += diff * Math.min(1, dt * 3);
    rocket.rotation.x = 0;
    rocket.rotation.z = 0;

    if (t >= 1) {
      setAutopilot(false);
      setNear(target);
      setTarget(null);
    }
  });

  return null;
}
