import { useEffect, type RefObject } from "react";
import { Group } from "three";
import { useGameStore } from "../state/useGameStore";

type Props = {
  rocketRef: RefObject<Group | null>;
  initialPosition: [number, number, number];
};

/**
 * After a session reset (resetSession was called → respawnCount changed),
 * snap the rocket back to its starting transform.
 */
export function RespawnHandler({ rocketRef, initialPosition }: Props) {
  const respawnCount = useGameStore((s) => s.respawnCount);

  useEffect(() => {
    if (respawnCount === 0) return;
    const rocket = rocketRef.current;
    if (!rocket) return;
    rocket.position.set(...initialPosition);
    rocket.rotation.set(0, 0, 0);
    // Only re-run on respawnCount change — initialPosition is a fresh array
    // ref each render and would otherwise re-snap the rocket every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [respawnCount]);

  return null;
}
