import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useGameStore } from "../state/useGameStore";
import { astronautTracker } from "./astronautTracker";

// Third-person rig parameters
const FOLLOW_DISTANCE = 4.2;   // how far behind the astronaut
const FOLLOW_HEIGHT = 2.2;     // camera height above the floor
const LOOK_AHEAD = 1.4;        // look slightly past the astronaut

const desired = new Vector3();
const lookTarget = new Vector3();
const orbitOffset = new Vector3();

/**
 * Third-person follow camera for the museum room.
 *
 * - Camera sits behind + above the astronaut, at FOLLOW_DISTANCE in the
 *   direction *opposite* to the astronaut's facing yaw.
 * - LookAt is slightly past the astronaut so the stone they're facing is
 *   in frame too.
 * - Optional pointer drag rotates the camera around the astronaut yaw —
 *   useful to peek to the side without breaking the over-shoulder feel.
 */
export function RoomCamera() {
  const { camera, gl } = useThree();
  const mode = useGameStore((s) => s.mode);

  // Player-controlled yaw offset added on top of the astronaut's yaw.
  // 0 = directly behind. Positive = camera orbits to astronaut's right.
  const yawOffset = useRef(0);
  const pitch = useRef(0);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  // On entering the room, snap to the follow rig immediately so we don't
  // see a long lerp from the previous (space / landing) camera position.
  useEffect(() => {
    if (mode !== "exploring") return;
    yawOffset.current = 0;
    pitch.current = 0;
    const yaw = astronautTracker.yaw + Math.PI; // behind = facing + π
    camera.position.set(
      astronautTracker.position.x + Math.sin(yaw) * FOLLOW_DISTANCE,
      astronautTracker.position.y + FOLLOW_HEIGHT,
      astronautTracker.position.z + Math.cos(yaw) * FOLLOW_DISTANCE
    );
    camera.lookAt(astronautTracker.position);
  }, [mode, camera]);

  // Pointer drag (right-click or any drag) rotates the orbit offset.
  useEffect(() => {
    if (mode !== "exploring") return;
    const dom = gl.domElement;
    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      dragging.current = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      yawOffset.current -= dx * 0.005;
      pitch.current = Math.max(-0.4, Math.min(0.5, pitch.current - dy * 0.004));
      last.current = { x: e.clientX, y: e.clientY };
    };
    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    return () => {
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
    };
  }, [mode, gl]);

  useFrame(() => {
    if (mode !== "exploring") return;

    const aPos = astronautTracker.position;
    const yaw = astronautTracker.yaw + Math.PI + yawOffset.current;
    const cosP = Math.cos(pitch.current);

    orbitOffset.set(
      Math.sin(yaw) * FOLLOW_DISTANCE * cosP,
      FOLLOW_HEIGHT + Math.sin(pitch.current) * FOLLOW_DISTANCE,
      Math.cos(yaw) * FOLLOW_DISTANCE * cosP
    );
    desired.copy(aPos).add(orbitOffset);

    // Soft follow — feels weighty but never falls behind on long walks
    camera.position.lerp(desired, 0.12);

    // Look slightly past the astronaut, in the direction they're facing,
    // so the stone they're approaching stays in frame.
    const facing = astronautTracker.yaw;
    lookTarget.set(
      aPos.x + Math.sin(facing) * LOOK_AHEAD,
      aPos.y + 1.2,
      aPos.z + Math.cos(facing) * LOOK_AHEAD
    );
    camera.lookAt(lookTarget);
  });

  return null;
}
