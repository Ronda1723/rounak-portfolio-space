import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useGameStore } from "../state/useGameStore";
import { ROOM_ORIGIN, ROOM_INTERIOR_Y } from "./Room";

const ROOM_LOOK = new Vector3(
  ROOM_ORIGIN[0],
  ROOM_ORIGIN[1] + 1.0,
  ROOM_ORIGIN[2]
);
const desired = new Vector3();
const lookTarget = new Vector3();

/**
 * While in "exploring" mode (after landing), the camera lives inside the
 * room. Click-and-drag rotates the camera around the room's center; the
 * camera position itself stays anchored on a circle around the center.
 */
export function RoomCamera() {
  const { camera, gl } = useThree();
  const mode = useGameStore((s) => s.mode);
  const yaw = useRef(Math.PI);
  const pitch = useRef(0);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const radius = 5.5;

  // On entering exploring mode, snap camera into the room
  useEffect(() => {
    if (mode === "exploring") {
      yaw.current = Math.PI;
      pitch.current = 0;
      camera.position.set(
        ROOM_ORIGIN[0],
        ROOM_ORIGIN[1] + ROOM_INTERIOR_Y,
        ROOM_ORIGIN[2] + radius
      );
      camera.lookAt(ROOM_LOOK);
    }
  }, [mode, camera]);

  // Pointer drag handlers
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
      yaw.current -= dx * 0.005;
      pitch.current = Math.max(
        -0.7,
        Math.min(0.4, pitch.current - dy * 0.004)
      );
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
    const cosP = Math.cos(pitch.current);
    desired.set(
      ROOM_ORIGIN[0] + Math.sin(yaw.current) * radius * cosP,
      ROOM_ORIGIN[1] + ROOM_INTERIOR_Y + Math.sin(pitch.current) * radius,
      ROOM_ORIGIN[2] + Math.cos(yaw.current) * radius * cosP
    );
    camera.position.lerp(desired, 0.15);
    lookTarget.set(ROOM_ORIGIN[0], ROOM_ORIGIN[1] + 1.0, ROOM_ORIGIN[2]);
    camera.lookAt(lookTarget);
  });

  return null;
}
