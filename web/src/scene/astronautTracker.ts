import { Vector3 } from "three";

/**
 * Position + yaw of the astronaut inside the museum room, in WORLD space.
 * Written by Astronaut each frame, read by RoomCamera (and any UI that
 * needs it) without going through React state.
 */
export const astronautTracker = {
  position: new Vector3(),
  yaw: 0,
};
