import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import { Group, Vector3 } from "three";
import { rocketTracker } from "./rocketTracker";
import { useGameStore } from "../state/useGameStore";

type Props = {
  rocketRef: RefObject<Group | null>;
};

const FOLLOW_OFFSET = new Vector3(0, 1.6, 5.5);

export function CameraFollow({ rocketRef }: Props) {
  const { camera } = useThree();
  const desired = useRef(new Vector3());
  const lookAt = useRef(new Vector3());
  const offset = useRef(new Vector3());
  const mode = useGameStore((s) => s.mode);

  // Snap camera back to rocket the moment we exit the room.
  useEffect(() => {
    if (mode !== "cruising") return;
    const rocket = rocketRef.current;
    if (!rocket) return;
    offset.current.copy(FOLLOW_OFFSET).applyEuler(rocket.rotation);
    camera.position.copy(rocket.position).add(offset.current);
    camera.lookAt(rocket.position);
  }, [mode, camera, rocketRef]);

  useFrame((_, dt) => {
    if (mode === "landing" || mode === "exploring") return;
    const rocket = rocketRef.current;
    if (!rocket) return;

    offset.current.copy(FOLLOW_OFFSET).applyEuler(rocket.rotation);
    desired.current.copy(rocket.position).add(offset.current);

    const lerpAmount = 1 - Math.pow(0.001, dt);
    camera.position.lerp(desired.current, lerpAmount);

    lookAt.current.copy(rocket.position);
    camera.lookAt(lookAt.current);

    // Publish rocket pose for non-R3F UI consumers.
    rocketTracker.position.copy(rocket.position);
    rocketTracker.yaw = rocket.rotation.y;
  });

  return null;
}
